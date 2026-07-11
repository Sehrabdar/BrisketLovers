import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IngredientEntity } from './entities/ingredient.entity';
import { RecipeIngredientEntity } from './entities/recipe-ingredient.entity';
import { MenuEntity } from '../menu/entities/menu.entity';

import { InventoryService } from './services/inventory.service';
import { RecipeService } from './services/recipe.service';
import { AvailabilityService } from './services/availability.service';
import { StockDeductionService } from './services/stock-deduction.service';

import { InventoryController } from './inventory.controller';
import { RecipeController } from './recipe.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IngredientEntity,
      RecipeIngredientEntity,
      MenuEntity, // Needed by AvailabilityService and RecipeService to read/write MenuEntity
    ]),
  ],
  controllers: [InventoryController, RecipeController],
  providers: [InventoryService, RecipeService, AvailabilityService, StockDeductionService],
  exports: [InventoryService, RecipeService, AvailabilityService, StockDeductionService],
})
export class InventoryModule {}
