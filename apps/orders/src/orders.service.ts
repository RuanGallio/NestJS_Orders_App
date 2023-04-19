import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateOrderRequest } from '@app/common/dto/create-order.request';
import { OrdersRepository } from './order.repository';
import { BILLING_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private readonly billingClient: ClientProxy,
  ) {}

  async getOrders() {
    return this.ordersRepository.find({});
  }

  async createOrder(request: CreateOrderRequest) {
    const session = await this.ordersRepository.startTransaction();
    try {
      const order = await this.ordersRepository.create(request, { session });
      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
        }),
      );
      await session.commitTransaction();
      return order;
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction();
      throw error;
    }
  }
}
