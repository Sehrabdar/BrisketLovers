import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { AnalyticsResponseDto } from './dto/analytics-response.dto';
import { Role } from '../core/global.constraints';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  async getDashboardAnalytics(): Promise<AnalyticsResponseDto> {
    const [totalOrders, revenue, dailyOrders, popularItems, activeStaff] = await Promise.all([
      this.ordersService.getTotalOrdersCount(),
      this.ordersService.getTotalRevenue(),
      this.ordersService.getDailyOrders(),
      this.ordersService.getPopularItems(),
      this.usersService.countByRole(Role.STAFF),
    ]);

    return {
      totalOrders,
      revenue,
      dailyOrders,
      popularItems,
      activeStaff,
    };
  }
}
