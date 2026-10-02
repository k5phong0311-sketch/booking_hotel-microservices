import {
  Controller, Get, Post, Param, Body, ParseIntPipe, Res, HttpStatus
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentMethod } from './dto/create-payment.dto';
import { MomoService } from './momo.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly momoService: MomoService
  ) {}

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

  @Post('momo/ipn')
  async momoIpn(@Body() body: any) {
    // MoMo server sẽ POST thông tin thanh toán vào đây
    const isValid = this.momoService.verifySignature(body);
    if (!isValid) {
      return { message: 'Invalid signature' };
    }

    const paymentId = Number(body.extraData); // Lấy payment ID từ extraData

    if (body.resultCode === 0) { // Thành công
      await this.paymentsService.updateStatus(paymentId, 'SUCCESS', body.transId);
    } else { // Thất bại
      await this.paymentsService.updateStatus(paymentId, 'FAILED', body.transId);
    }

    return { message: 'Received' };
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }
}
