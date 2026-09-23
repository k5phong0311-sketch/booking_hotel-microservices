import {
  Controller, Get, Post, Param, Body, ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /api/payments — Xử lý thanh toán (gọi bởi Booking Service)
  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  // GET /api/payments/booking/:bookingId — Lấy thanh toán theo booking
  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.paymentsService.findByBooking(bookingId);
  }

  // GET /api/payments/user/:userId — Lịch sử thanh toán của user
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.findByUser(userId);
  }

  // GET /api/payments/:id — Chi tiết 1 giao dịch
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }
}
