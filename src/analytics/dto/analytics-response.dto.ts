import { ApiProperty } from '@nestjs/swagger';

export class DailyOrderMetricDto {
  @ApiProperty({ example: '2026-06-04' })
  date: string;

  @ApiProperty({ example: 12 })
  count: number;
}

export class PopularItemMetricDto {
  @ApiProperty({ example: 'Brisket Burger' })
  name: string;

  @ApiProperty({ example: 85 })
  quantity: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({ example: 150 })
  totalOrders: number;

  @ApiProperty({ example: 3450.75 })
  revenue: number;

  @ApiProperty({ type: [DailyOrderMetricDto] })
  dailyOrders: DailyOrderMetricDto[];

  @ApiProperty({ type: [PopularItemMetricDto] })
  popularItems: PopularItemMetricDto[];

  @ApiProperty({ example: 5 })
  activeStaff: number;
}
