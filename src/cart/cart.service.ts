import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { MenuService } from '../menu/menu.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';
import { AvailabilityService } from '../inventory/services/availability.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    private readonly menuService: MenuService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async findOrCreateCart(userId: string): Promise<CartEntity> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.menuItem'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      cart = await this.cartRepository.save(cart);
    }
    return cart;
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.findOrCreateCart(userId);
    return this.mapCartToResponse(cart);
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<CartResponseDto> {
    const cart = await this.findOrCreateCart(userId);
    const menuItem = await this.menuService.findOneEntity(dto.menuItemId);

    if (!menuItem.available) {
      throw new BadRequestException(`Menu item '${menuItem.name}' is currently unavailable`);
    }

    let existingItem = cart.items.find((item) => item.menuItemId === dto.menuItemId);

    if (existingItem) {
      existingItem.quantity += dto.quantity ?? 1;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        menuItemId: dto.menuItemId,
        quantity: dto.quantity ?? 1,
      });
      await this.cartItemRepository.save(newItem);
    }

    const updatedCart = await this.findOrCreateCart(userId);
    return this.mapCartToResponse(updatedCart);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartResponseDto> {
    const cart = await this.findOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found in user's cart`);
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    const updatedCart = await this.findOrCreateCart(userId);
    return this.mapCartToResponse(updatedCart);
  }

  async removeItem(userId: string, itemId: string): Promise<CartResponseDto> {
    const cart = await this.findOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found in user's cart`);
    }

    await this.cartItemRepository.remove(item);

    const updatedCart = await this.findOrCreateCart(userId);
    return this.mapCartToResponse(updatedCart);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.findOrCreateCart(userId);
    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  private async mapCartToResponse(cart: CartEntity): Promise<CartResponseDto> {
    let totalPrice = 0;
    let totalItems = 0;

    const cartSnapshot = cart.items.map((i) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
    }));

    const items: CartItemResponseDto[] = await Promise.all(
      cart.items.map(async (item) => {
        const price = Number(item.menuItem.price);
        const subtotal = price * item.quantity;
        totalPrice += subtotal;
        totalItems += item.quantity;

        const reserved = await this.availabilityService.buildCartReservations(
          cartSnapshot,
          item.menuItemId,
        );
        const servings = await this.availabilityService.calculateServingsWithReservations(
          item.menuItemId,
          reserved,
        );
        const availableServings = servings === Infinity ? -1 : servings;

        return {
          id: item.id,
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          imageUrl: item.menuItem.imageUrl,
          price,
          quantity: item.quantity,
          subtotal: Number(subtotal.toFixed(2)),
          availableServings,
        };
      }),
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalPrice: Number(totalPrice.toFixed(2)),
      totalItems,
    };
  }
}
