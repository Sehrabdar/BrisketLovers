import { ApiProperty } from '@nestjs/swagger';

export enum StockStatus {
  OK = 'OK',
  LOW = 'LOW',
  OUT = 'OUT',
}

export class IngredientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  currentStock: number;

  @ApiProperty()
  minimumThreshold: number;

  @ApiProperty({ enum: StockStatus })
  status: StockStatus;

  @ApiProperty({ description: 'Maximum servings possible based on current stock for items using this ingredient' })
  availableServings: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class InventoryDashboardDto {
  @ApiProperty()
  totalIngredients: number;

  @ApiProperty()
  lowStockCount: number;

  @ApiProperty()
  outOfStockCount: number;

  @ApiProperty({ type: [IngredientResponseDto] })
  lowStockItems: IngredientResponseDto[];

  @ApiProperty({ type: [IngredientResponseDto] })
  outOfStockItems: IngredientResponseDto[];
}
