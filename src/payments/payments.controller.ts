import { Controller, Post, Get, Body, Param, Req, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { Role } from '../core/global.constraints';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create Stripe PaymentIntent for an order (Customer only)' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async createIntent(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentsService.createPaymentIntent(userId, dto);
  }

  @Post('confirm-mock/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Simulate/mock a successful payment (for local testing/dev)' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async confirmMock(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PaymentResponseDto> {
    return await this.paymentsService.confirmPaymentMock(orderId, userId);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.STAFF, Role.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get payment status of an order' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async getStatus(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<PaymentResponseDto> {
    return await this.paymentsService.getPaymentStatus(orderId, userId, userRole);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook handler (called by Stripe)' })
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    // Stripe webhooks require the raw body. If a parser already converted it, we read from rawBody if present
    const rawBody = (req as any).rawBody || req.body;
    const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody);
    await this.paymentsService.handleWebhook(bodyString, signature);
  }
}
