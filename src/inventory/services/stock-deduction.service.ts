import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeIngredientEntity } from '../entities/recipe-ingredient.entity';
import { IngredientEntity } from '../entities/ingredient.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { AvailabilityService } from './availability.service';

@Injectable()
export class StockDeductionService {
  private readonly logger = new Logger(StockDeductionService.name);

  constructor(
    @InjectRepository(RecipeIngredientEntity)
    private readonly recipeIngredientRepo: Repository<RecipeIngredientEntity>,
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepo: Repository<IngredientEntity>,
    private readonly availabilityService: AvailabilityService,
  ) {}

  /**
   * Deducts ingredient stock for all items in a completed order.
   * Called by OrdersService when order status transitions to COMPLETED.
   */
  async deductForOrder(order: OrderEntity): Promise<void> {
    if (!order.items || order.items.length === 0) {
      this.logger.warn(`Order ${order.id} has no items — skipping stock deduction`);
      return;
    }

    const affectedIngredientIds = new Set<string>();

    for (const orderItem of order.items) {
      if (!orderItem.menuItemId) {
        this.logger.warn(
          `Order item ${orderItem.id} has no menuItemId (item may have been deleted) — skipping`,
        );
        continue;
      }

      const recipeIngredients = await this.recipeIngredientRepo.find({
        where: { menuItemId: orderItem.menuItemId },
        relations: ['ingredient'],
      });

      if (recipeIngredients.length === 0) {
        this.logger.debug(
          `No recipe found for menu item ${orderItem.menuItemId} — no stock to deduct`,
        );
        continue;
      }

      for (const ri of recipeIngredients) {
        const totalDeduction = Number(ri.quantityRequired) * orderItem.quantity;
        const current = Number(ri.ingredient.currentStock);
        const newStock = Math.max(0, current - totalDeduction);

        if (current - totalDeduction < 0) {
          this.logger.warn(
            `Stock for "${ri.ingredient.name}" insufficient. ` +
            `Required: ${totalDeduction}, Available: ${current}. Clamping to 0.`,
          );
        }

        ri.ingredient.currentStock = newStock;
        await this.ingredientRepo.save(ri.ingredient);

        affectedIngredientIds.add(ri.ingredientId);

        this.logger.log(
          `Deducted ${totalDeduction} ${ri.ingredient.unit} of "${ri.ingredient.name}" ` +
          `for order ${order.id} (${current} → ${newStock})`,
        );
      }
    }

    for (const ingredientId of affectedIngredientIds) {
      await this.availabilityService.recalculateAllAffectedByIngredient(ingredientId);
    }

    this.logger.log(
      `Stock deduction complete for order ${order.id}. ` +
      `Affected ingredients: ${affectedIngredientIds.size}`,
    );
  }
}
