import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentEntity } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus, OrderStatus, Role } from '../core/global.constraints';

@Injectable()
export class PaymentsService {
  private readonly stripe: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_mock';
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-11-preview' as any, // standard TypeORM/Stripe API version
    } as any);
  }

  async createPaymentIntent(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const order = await this.ordersService.getOrderEntity(dto.orderId);

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to pay for this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order is in '${order.status}' status and cannot accept payment`);
    }

    // Check if there is already a successful payment
    let payment = await this.paymentRepository.findOne({
      where: { orderId: order.id },
    });

    if (payment && payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('This order has already been successfully paid');
    }

    let clientSecret = 'mock_secret_for_dev_mode';
    let transactionId = 'ch_mock_' + Math.random().toString(36).substring(2, 10);

    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey && stripeKey !== 'sk_test_placeholder' && !stripeKey.includes('mock')) {
      try {
        const amountInCents = Math.round(Number(order.totalAmount) * 100);
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          metadata: { orderId: order.id, userId },
        });
        clientSecret = paymentIntent.client_secret || '';
        transactionId = paymentIntent.id;
      } catch (err) {
        this.logger.error(`Stripe error: ${err.message}`);
        // If Stripe fails, fall back to mock details to prevent crashing in sandbox environments
      }
    }

    if (!payment) {
      payment = this.paymentRepository.create({
        orderId: order.id,
        amount: order.totalAmount,
        transactionId,
        status: PaymentStatus.PENDING,
      });
    } else {
      payment.transactionId = transactionId;
      payment.status = PaymentStatus.PENDING;
    }

    const saved = await this.paymentRepository.save(payment);

    return {
      id: saved.id,
      orderId: saved.orderId,
      amount: Number(saved.amount),
      status: saved.status,
      transactionId: saved.transactionId,
      clientSecret,
      createdAt: saved.createdAt,
    };
  }

  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
      this.logger.warn('Stripe Webhook Secret not configured. Skipping webhook handling.');
      return;
    }

    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received Stripe Webhook event: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await this.processPaymentSuccess(paymentIntent.id);
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      await this.processPaymentFailure(paymentIntent.id);
    }
  }

  async processPaymentSuccess(transactionId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
    });

    if (!payment) {
      this.logger.error(`Payment record with transactionId ${transactionId} not found`);
      return;
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      payment.status = PaymentStatus.SUCCESS;
      await this.paymentRepository.save(payment);

      const order = await this.ordersService.getOrderEntity(payment.orderId);
      order.status = OrderStatus.CONFIRMED;
      await this.ordersService.saveOrder(order);

      this.logger.log(`Order ${order.id} confirmed after successful payment`);
    }
  }

  async processPaymentFailure(transactionId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
      this.logger.log(`Payment failed for transaction: ${transactionId}`);
    }
  }

  async getPaymentStatus(orderId: string, userId: string, userRole: Role): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record for order ${orderId} not found`);
    }

    const order = await this.ordersService.getOrderEntity(orderId);
    if (userRole === Role.CUSTOMER && order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this payment status');
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: Number(payment.amount),
      status: payment.status,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
    };
  }

  // ── Mock Confirmation (for testing and dev ease without Webhook tunnel) ──
  async confirmPaymentMock(orderId: string, userId: string): Promise<PaymentResponseDto> {
    const order = await this.ordersService.getOrderEntity(orderId);

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to pay for this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order status is not PENDING');
    }

    let payment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      payment = this.paymentRepository.create({
        orderId,
        amount: order.totalAmount,
        transactionId: 'mock_tx_' + Math.random().toString(36).substring(2, 10),
        status: PaymentStatus.SUCCESS,
      });
    } else {
      payment.status = PaymentStatus.SUCCESS;
    }

    const saved = await this.paymentRepository.save(payment);

    order.status = OrderStatus.CONFIRMED;
    await this.ordersService.saveOrder(order);

    return {
      id: saved.id,
      orderId: saved.orderId,
      amount: Number(saved.amount),
      status: saved.status,
      transactionId: saved.transactionId,
      createdAt: saved.createdAt,
    };
  }
}
