import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MenuEntity } from '../../menu/entities/menu.entity';
import { RecipeIngredientEntity } from '../entities/recipe-ingredient.entity';
import { IngredientEntity } from '../entities/ingredient.entity';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepo: Repository<MenuEntity>,
    @InjectRepository(RecipeIngredientEntity)
    private readonly recipeIngredientRepo: Repository<RecipeIngredientEntity>,
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepo: Repository<IngredientEntity>,
  ) {}

  /**
   * Returns how many servings of a dish can be made: min(floor(stock / qty))
   * across all recipe ingredients. Returns Infinity when no recipe is assigned,
   * indicating the item is under manual availability control.
   */
  async calculateServings(menuItemId: string): Promise<number> {
    const recipeIngredients = await this.recipeIngredientRepo.find({
      where: { menuItemId },
      relations: ['ingredient'],
    });

    if (recipeIngredients.length === 0) {
      return Infinity;
    }

    let minServings = Infinity;
    for (const ri of recipeIngredients) {
      const stock = Number(ri.ingredient.currentStock);
      const required = Number(ri.quantityRequired);

      if (required <= 0) continue;

      const possible = Math.floor(stock / required);
      if (possible < minServings) {
        minServings = possible;
      }
    }

    return minServings === Infinity ? 0 : minServings;
  }

  /**
   * Builds a map of ingredientId → total quantity already reserved by all cart
   * items EXCEPT the one identified by excludeMenuItemId.
   * Used to correctly cap servings when multiple dishes share an ingredient.
   */
  async buildCartReservations(
    cartItems: { menuItemId: string; quantity: number }[],
    excludeMenuItemId: string,
  ): Promise<Map<string, number>> {
    const reserved = new Map<string, number>();

    for (const item of cartItems) {
      if (item.menuItemId === excludeMenuItemId) continue;

      const recipe = await this.recipeIngredientRepo.find({
        where: { menuItemId: item.menuItemId },
      });

      for (const ri of recipe) {
        const current = reserved.get(ri.ingredientId) ?? 0;
        reserved.set(ri.ingredientId, current + Number(ri.quantityRequired) * item.quantity);
      }
    }

    return reserved;
  }

  /**
   * Like calculateServings, but subtracts the quantities already reserved by
   * other cart items before computing the serving cap.
   */
  async calculateServingsWithReservations(
    menuItemId: string,
    reserved: Map<string, number>,
  ): Promise<number> {
    const recipeIngredients = await this.recipeIngredientRepo.find({
      where: { menuItemId },
      relations: ['ingredient'],
    });

    if (recipeIngredients.length === 0) {
      return Infinity;
    }

    let minServings = Infinity;
    for (const ri of recipeIngredients) {
      const stock = Number(ri.ingredient.currentStock);
      const required = Number(ri.quantityRequired);

      if (required <= 0) continue;

      const alreadyReserved = reserved.get(ri.ingredientId) ?? 0;
      const effectiveStock = Math.max(0, stock - alreadyReserved);
      const possible = Math.floor(effectiveStock / required);

      if (possible < minServings) {
        minServings = possible;
      }
    }

    return minServings === Infinity ? 0 : minServings;
  }

  /**
   * Writes menu.available based on calculated servings.
   * Items without a recipe are skipped — they remain manually controlled.
   * Only persists when the value actually changes to avoid unnecessary writes.
   */
  async recalculateAvailability(menuItemId: string): Promise<void> {
    const menuItem = await this.menuRepo.findOne({
      where: { id: menuItemId, deletedAt: IsNull() },
    });

    if (!menuItem) return;

    const servings = await this.calculateServings(menuItemId);

    if (servings === Infinity) {
      return;
    }

    const shouldBeAvailable = servings > 0;
    if (menuItem.available !== shouldBeAvailable) {
      menuItem.available = shouldBeAvailable;
      await this.menuRepo.save(menuItem);
      this.logger.log(
        `Menu item "${menuItem.name}" availability → ${shouldBeAvailable} (servings: ${servings})`,
      );
    }
  }

  async recalculateAllAffectedByIngredient(ingredientId: string): Promise<void> {
    const affectedRecipes = await this.recipeIngredientRepo.find({
      where: { ingredientId },
    });

    const uniqueMenuItemIds = [...new Set(affectedRecipes.map((r) => r.menuItemId))];

    for (const menuItemId of uniqueMenuItemIds) {
      await this.recalculateAvailability(menuItemId);
    }

    if (uniqueMenuItemIds.length > 0) {
      this.logger.log(
        `Recalculated availability for ${uniqueMenuItemIds.length} menu item(s) after ingredient ${ingredientId} stock change`,
      );
    }

    // TODO: emit a WebSocket/SSE event here for real-time menu updates.
  }

  async recalculateAll(): Promise<void> {
    const allMenuItems = await this.menuRepo.find({
      where: { deletedAt: IsNull() },
    });

    for (const item of allMenuItems) {
      await this.recalculateAvailability(item.id);
    }

    this.logger.log(`Full availability recalculation completed for ${allMenuItems.length} menu items`);
  }
}
