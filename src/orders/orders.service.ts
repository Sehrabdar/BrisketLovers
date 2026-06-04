import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListParamsDto } from './dto/order-list-params.dto';
import { OrderResponseDto, OrderListDto } from './dto/order-response.dto';
import { OrderStatus, Role } from '../core/global.constraints';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly cartService: CartService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot place an order with an empty cart');
    }

    // Create Order Entity
    const order = this.orderRepository.create({
      userId,
      status: OrderStatus.PENDING,
      totalAmount: cart.totalPrice,
      items: [],
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create Order Items Snapshots
    const orderItems = cart.items.map((cartItem) => {
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        menuItemId: cartItem.menuItemId,
        name: cartItem.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
      });
    });

    await this.orderItemRepository.save(orderItems);

    // Clear cart
    await this.cartService.clearCart(userId);

    // Fetch order with relationships
    const fullOrder = await this.getOrderEntityWithRelations(savedOrder.id);
    return this.mapOrderToResponse(fullOrder);
  }

  async getOrder(orderId: string, userId: string, userRole: Role): Promise<OrderResponseDto> {
    const order = await this.getOrderEntityWithRelations(orderId);

    if (userRole === Role.CUSTOMER && order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return this.mapOrderToResponse(order);
  }

  async listOrders(params: OrderListParamsDto, userId: string, userRole: Role): Promise<OrderListDto> {
    const where: any = {};

    if (userRole === Role.CUSTOMER) {
      where.userId = userId;
    } else if (params.status) {
      where.status = params.status;
    }

    const [orders, count] = await this.orderRepository.findAndCount({
      where,
      relations: ['user', 'items'],
      order: { createdAt: params.orderDirection || 'DESC' },
      take: params.limit,
      skip: params.offset,
    });

    return {
      orders: orders.map((o) => this.mapOrderToResponse(o)),
      count,
    };
  }

  async updateOrderStatus(
    orderId: string,
    targetStatus: OrderStatus,
    userId: string,
    userRole: Role,
  ): Promise<OrderResponseDto> {
    const order = await this.getOrderEntityWithRelations(orderId);

    this.validateTransition(order.status, targetStatus);

    order.status = targetStatus;
    order.updatedBy = userId;

    const saved = await this.orderRepository.save(order);
    return this.mapOrderToResponse(saved);
  }

  async getOrderEntity(orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, deletedAt: IsNull() },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  async saveOrder(order: OrderEntity): Promise<OrderEntity> {
    return await this.orderRepository.save(order);
  }

  private async getOrderEntityWithRelations(orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, deletedAt: IsNull() },
      relations: ['user', 'items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  private validateTransition(current: OrderStatus, target: OrderStatus) {
    if (target === OrderStatus.CANCELLED) {
      if (current === OrderStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed order');
      }
      return;
    }

    const flow = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = flow[current] || [];
    if (!allowed.includes(target)) {
      throw new BadRequestException(`Invalid status transition from ${current} to ${target}`);
    }
  }

  private mapOrderToResponse(order: OrderEntity): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      userName: order.user?.name || 'Deleted User',
      userEmail: order.user?.email || 'N/A',
      status: order.status,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  // ── Analytics Functions (for Phase 8) ──

  async getTotalOrdersCount(): Promise<number> {
    return await this.orderRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.deletedAt IS NULL')
      .getRawOne();
    return Number(result?.total || 0);
  }

  async getDailyOrders(): Promise<{ date: string; count: number }[]> {
    const rawDaily = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('order.deletedAt IS NULL')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
    return rawDaily.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }));
  }

  async getPopularItems(): Promise<{ name: string; quantity: number }[]> {
    const items = await this.orderItemRepository
      .createQueryBuilder('item')
      .select('item.name', 'name')
      .addSelect('SUM(item.quantity)', 'quantity')
      .groupBy('item.name')
      .orderBy('quantity', 'DESC')
      .limit(5)
      .getRawMany();
    return items.map((i) => ({
      name: i.name,
      quantity: Number(i.quantity),
    }));
  }
}
