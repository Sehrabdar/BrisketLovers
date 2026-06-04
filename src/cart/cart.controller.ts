import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { Role } from '../core/global.constraints';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer cart details' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async getCart(@CurrentUser('id') userId: string): Promise<CartResponseDto> {
    return await this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a menu item to the cart' })
  @ApiResponse({ status: 201, type: CartResponseDto })
  async addItem(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.addItem(userId, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update quantity of an item in the cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async updateItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.updateItem(userId, itemId, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async removeItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
  ): Promise<CartResponseDto> {
    return await this.cartService.removeItem(userId, itemId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all items in the cart' })
  @ApiResponse({ status: 204, description: 'Cart cleared successfully' })
  async clearCart(@CurrentUser('id') userId: string): Promise<void> {
    await this.cartService.clearCart(userId);
  }
}
