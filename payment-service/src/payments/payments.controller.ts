import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentMethod } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { MomoService } from './momo.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly momoService: MomoService,
  ) {}

  // POST /api/payments — Tạo giao dịch thanh toán
  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(dto);

    // Nếu chọn MOMO, gọi API tạo giao dịch MoMo
    if (dto.method === PaymentMethod.MOMO) {
      try {
        const momoResult = await this.momoService.createPayment(payment.id, Number(payment.amount));
        return {
          payment,
          momoUrl: momoResult.payUrl || `http://localhost:5173/payment/callback?orderId=${payment.id}&resultCode=0&message=Success`,
        };
      } catch (err) {
        // Fallback mock url if real API fails
        return {
          payment,
          momoUrl: `http://localhost:5173/payment/callback?orderId=${payment.id}&resultCode=0&message=Mocked_Success`,
        };
      }
    }

    return { payment };
  }

  // POST /api/payments/momo/ipn — Webhook từ cổng MoMo
  @Post('momo/ipn')
  async momoIpn(@Body() body: any) {
    const isValid = this.momoService.verifySignature(body);
    if (!isValid) {
      return { message: 'Invalid signature' };
    }

    const paymentId = Number(body.extraData);

    if (body.resultCode === 0) {
      await this.paymentsService.updateStatus(paymentId, 'SUCCESS', body.transId);
    } else {
      await this.paymentsService.updateStatus(paymentId, 'FAILED', body.transId);
    }

    return { message: 'Received' };
  }

  // GET /api/payments — Lấy danh sách giao dịch có phân trang & lọc
  @Get()
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentsService.findAll(query);
  }

  // GET /api/payments/stats/summary — Thống kê doanh thu & giao dịch
  @Get('stats/summary')
  getStats() {
    return this.paymentsService.getStats();
  }

  // GET /api/payments/booking/:bookingId — Tìm giao dịch theo mã booking
  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.paymentsService.findByBooking(bookingId);
  }

  // GET /api/payments/user/:userId — Tìm giao dịch theo khách hàng
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.findByUser(userId);
  }

  // GET /api/payments/:id — Chi tiết giao dịch
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  // POST /api/payments/:id/refund — Hoàn tiền giao dịch
  @Post(':id/refund')
  refund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentsService.refund(id, dto);
  }

  // POST /api/payments/:id/cancel — Hủy giao dịch đang chờ
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.paymentsService.cancel(id, reason);
  }
}
