import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { IngredientEntity } from '../entities/ingredient.entity';
import { RecipeIngredientEntity } from '../entities/recipe-ingredient.entity';
import { CreateIngredientDto } from '../dto/create-ingredient.dto';
import { UpdateIngredientDto } from '../dto/update-ingredient.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import {
  IngredientResponseDto,
  InventoryDashboardDto,
  StockStatus,
} from '../dto/ingredient-response.dto';
import { AvailabilityService } from './availability.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepo: Repository<IngredientEntity>,
    @InjectRepository(RecipeIngredientEntity)
    private readonly recipeIngredientRepo: Repository<RecipeIngredientEntity>,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
    const ingredient = this.ingredientRepo.create({
      name: dto.name,
      unit: dto.unit,
      currentStock: dto.currentStock ?? 0,
      minimumThreshold: dto.minimumThreshold ?? 0,
    });
    const saved = await this.ingredientRepo.save(ingredient);
    return this.mapToResponse(saved);
  }

  async findAll(): Promise<IngredientResponseDto[]> {
    const ingredients = await this.ingredientRepo.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
    return ingredients.map((i) => this.mapToResponse(i));
  }

  async findOne(id: string): Promise<IngredientResponseDto> {
    const ingredient = await this.findOneEntity(id);
    return this.mapToResponse(ingredient);
  }

  async findOneEntity(id: string): Promise<IngredientEntity> {
    const ingredient = await this.ingredientRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  async update(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto> {
    const ingredient = await this.findOneEntity(id);
    Object.assign(ingredient, dto);
    const saved = await this.ingredientRepo.save(ingredient);

    await this.availabilityService.recalculateAllAffectedByIngredient(id);

    return this.mapToResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const ingredient = await this.findOneEntity(id);

    // Block deletion if the ingredient is referenced by any recipe.
    const usageCount = await this.recipeIngredientRepo.count({
      where: { ingredientId: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `Cannot delete ingredient "${ingredient.name}" — it is used in ${usageCount} recipe(s). Remove it from all recipes first.`,
      );
    }

    await this.ingredientRepo.softRemove(ingredient);
  }

  async adjustStock(id: string, dto: UpdateStockDto): Promise<IngredientResponseDto> {
    const ingredient = await this.findOneEntity(id);

    const newStock = Number(ingredient.currentStock) + dto.delta;
    if (newStock < 0) {
      throw new BadRequestException(
        `Cannot reduce stock below 0. Current stock: ${ingredient.currentStock}, requested change: ${dto.delta}`,
      );
    }

    ingredient.currentStock = newStock;
    const saved = await this.ingredientRepo.save(ingredient);

    this.logger.log(
      `Stock adjusted for "${ingredient.name}": ${ingredient.currentStock} → ${newStock}${dto.note ? ` (${dto.note})` : ''}`,
    );

    await this.availabilityService.recalculateAllAffectedByIngredient(id);

    return this.mapToResponse(saved);
  }

  /**
   * Used internally by StockDeductionService.
   * Clamps to 0 rather than throwing, because negative stock from concurrent
   * order completion is handled by a warning rather than a hard failure.
   */
  async deductStock(id: string, amount: number): Promise<void> {
    const ingredient = await this.findOneEntity(id);
    const current = Number(ingredient.currentStock);
    const newStock = Math.max(0, current - amount);

    if (current - amount < 0) {
      this.logger.warn(
        `Stock for "${ingredient.name}" would go negative (${current} - ${amount}). Clamping to 0.`,
      );
    }

    ingredient.currentStock = newStock;
    await this.ingredientRepo.save(ingredient);
  }

  async getDashboard(): Promise<InventoryDashboardDto> {
    const ingredients = await this.ingredientRepo.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });

    const mapped = ingredients.map((i) => this.mapToResponse(i));
    const lowStockItems = mapped.filter((i) => i.status === StockStatus.LOW);
    const outOfStockItems = mapped.filter((i) => i.status === StockStatus.OUT);

    return {
      totalIngredients: mapped.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems,
    };
  }

  /**
   * Aggregates required quantities across all items in a cart, then verifies
   * each ingredient has enough stock. Called before an order is persisted so
   * we never accept an order we cannot fulfil.
   */
  async validateStockForItems(
    items: { menuItemId: string; name: string; quantity: number }[],
  ): Promise<void> {
    const ingredientRequirements = new Map<string, { required: number; ingredientId: string }>();

    for (const item of items) {
      const recipes = await this.recipeIngredientRepo.find({
        where: { menuItemId: item.menuItemId },
        relations: ['ingredient'],
      });

      for (const ri of recipes) {
        const required = Number(ri.quantityRequired) * item.quantity;
        const existing = ingredientRequirements.get(ri.ingredientId);
        if (existing) {
          existing.required += required;
        } else {
          ingredientRequirements.set(ri.ingredientId, {
            required,
            ingredientId: ri.ingredientId,
          });
        }
      }
    }

    for (const [ingredientId, { required }] of ingredientRequirements) {
      const ingredient = await this.findOneEntity(ingredientId);
      if (Number(ingredient.currentStock) < required) {
        throw new BadRequestException(
          `Insufficient stock for ingredient "${ingredient.name}". Required: ${required} ${ingredient.unit}, Available: ${ingredient.currentStock} ${ingredient.unit}. One or more items in your order cannot be fulfilled.`,
        );
      }
    }
  }

  mapToResponse(ingredient: IngredientEntity): IngredientResponseDto {
    const stock = Number(ingredient.currentStock);
    const threshold = Number(ingredient.minimumThreshold);

    let status: StockStatus;
    if (stock <= 0) {
      status = StockStatus.OUT;
    } else if (stock <= threshold) {
      status = StockStatus.LOW;
    } else {
      status = StockStatus.OK;
    }

    return {
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: stock,
      minimumThreshold: threshold,
      status,
      // availableServings at the ingredient level is just the raw stock;
      // per-dish servings are computed by AvailabilityService.
      availableServings: stock,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }
}
