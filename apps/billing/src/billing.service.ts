import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderRequest } from '@app/common/dto/create-order.request';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  getHello(): string {
    return 'Hello World!';
  }

  bill(request: CreateOrderRequest) {
    this.logger.log('Billing request: ' + JSON.stringify(request));
  }
}
