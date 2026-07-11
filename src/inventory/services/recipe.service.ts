import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeIngredientEntity } from '../entities/recipe-ingredient.entity';
import { IngredientEntity } from '../entities/ingredient.entity';
import { MenuEntity } from '../../menu/entities/menu.entity';
import { UpsertRecipeDto } from '../dto/upsert-recipe.dto';
import { RecipeIngredientResponseDto, RecipeResponseDto } from '../dto/recipe-ingredient-response.dto';
import { AvailabilityService } from './availability.service';

@Injectable()
export class RecipeService {
  private readonly logger = new Logger(RecipeService.name);

  constructor(
    @InjectRepository(RecipeIngredientEntity)
    private readonly recipeIngredientRepo: Repository<RecipeIngredientEntity>,
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepo: Repository<IngredientEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepo: Repository<MenuEntity>,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async getRecipe(menuItemId: string): Promise<RecipeResponseDto> {
    const menuItem = await this.menuRepo.findOne({ where: { id: menuItemId } });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    const recipeIngredients = await this.recipeIngredientRepo.find({
      where: { menuItemId },
      relations: ['ingredient'],
      order: { ingredient: { name: 'ASC' } } as any,
    });

    const servings = await this.availabilityService.calculateServings(menuItemId);

    return {
      menuItemId,
      menuItemName: menuItem.name,
      ingredients: recipeIngredients.map((ri) => this.mapRItoResponse(ri)),
      availableServings: servings === Infinity ? -1 : servings,
    };
  }

  async upsertRecipe(menuItemId: string, dto: UpsertRecipeDto): Promise<RecipeResponseDto> {
    const menuItem = await this.menuRepo.findOne({ where: { id: menuItemId } });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    for (const item of dto.ingredients) {
      const ingredient = await this.ingredientRepo.findOne({ where: { id: item.ingredientId } });
      if (!ingredient) {
        throw new NotFoundException(`Ingredient with ID ${item.ingredientId} not found`);
      }
    }

    // Delete existing rows then re-insert so the caller always supplies the full recipe.
    await this.recipeIngredientRepo.delete({ menuItemId });

    const newEntries = dto.ingredients.map((item) =>
      this.recipeIngredientRepo.create({
        menuItemId,
        ingredientId: item.ingredientId,
        quantityRequired: item.quantityRequired,
      }),
    );

    await this.recipeIngredientRepo.save(newEntries);

    this.logger.log(`Recipe upserted for menu item "${menuItem.name}" (${newEntries.length} ingredients)`);

    await this.availabilityService.recalculateAvailability(menuItemId);

    return this.getRecipe(menuItemId);
  }

  async deleteRecipe(menuItemId: string): Promise<void> {
    const menuItem = await this.menuRepo.findOne({ where: { id: menuItemId } });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    await this.recipeIngredientRepo.delete({ menuItemId });

    this.logger.log(`Recipe removed for menu item "${menuItem.name}" — availability reverts to manual control`);
  }

  async getAllRecipes(): Promise<RecipeResponseDto[]> {
    const menuItems = await this.menuRepo.find({ order: { name: 'ASC' } });
    const results: RecipeResponseDto[] = [];

    for (const item of menuItems) {
      const recipe = await this.getRecipe(item.id);
      results.push(recipe);
    }

    return results;
  }

  private mapRItoResponse(ri: RecipeIngredientEntity): RecipeIngredientResponseDto {
    return {
      id: ri.id,
      ingredientId: ri.ingredientId,
      ingredientName: ri.ingredient?.name ?? 'Unknown',
      unit: ri.ingredient?.unit ?? '',
      quantityRequired: Number(ri.quantityRequired),
      currentStock: Number(ri.ingredient?.currentStock ?? 0),
    };
  }
}
