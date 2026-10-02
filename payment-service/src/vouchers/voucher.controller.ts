import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { VoucherService } from './voucher.service';

@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('broadcast')
  @HttpCode(201)
  async broadcast(@Body() body: { code: string; discount: number; quantity: number }) {
    const v = await this.voucherService.createBroadcast(body.code, body.discount, body.quantity);
    return { message: 'Broadcast thành công', data: v };
  }

  @Post('apply')
  @HttpCode(200)
  async apply(@Body() body: { code: string }) {
    await this.voucherService.applyVoucher(body.code);
    return { message: 'Áp dụng Voucher thành công!' };
  }
}
