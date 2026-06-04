import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListParamsDto } from './dto/order-list-params.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderResponseDto, OrderListDto } from './dto/order-response.dto';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { Role } from '../core/global.constraints';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Place a new order using items from current cart (Customer only)' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.ordersService.createOrder(userId, dto);
  }

  @Get()
  @Roles(Role.CUSTOMER, Role.STAFF, Role.SUPERADMIN)
  @ApiOperation({ summary: 'List orders (Customer sees own, Staff/Admin see all)' })
  @ApiResponse({ status: 200, type: OrderListDto })
  async findAll(
    @Query() queryParams: OrderListParamsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<OrderListDto> {
    return await this.ordersService.listOrders(queryParams, userId, userRole);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.STAFF, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get details of a single order' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<OrderResponseDto> {
    return await this.ordersService.getOrder(id, userId, userRole);
  }

  @Patch(':id/status')
  @Roles(Role.STAFF, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update order status (Staff/Admin only)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<OrderResponseDto> {
    return await this.ordersService.updateOrderStatus(id, dto.status, userId, userRole);
  }
}
