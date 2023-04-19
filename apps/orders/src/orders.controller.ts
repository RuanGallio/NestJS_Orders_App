import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderRequest } from '@app/common/dto/create-order.request';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders() {
    return this.ordersService.getOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Body() request: CreateOrderRequest, @Req() req: Request) {
    return this.ordersService.createOrder(request);
  }
}
