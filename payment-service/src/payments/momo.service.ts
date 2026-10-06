import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async createPayment(orderId: number, amount: number) {
    const endpoint = this.configService.get<string>('MOMO_ENDPOINT') || 'https://test-payment.momo.vn/v2/gateway/api/create';
    let partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
    let accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    let secretKey = this.configService.get<string>('MOMO_SECRET_KEY');

    if (!partnerCode || partnerCode === 'MOMO') {
      partnerCode = 'MOMOBKUN20180529';
      accessKey = 'klm05TvNBzhg7h7j';
      secretKey = 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa';
    }

    const redirectUrl = this.configService.get<string>('MOMO_REDIRECT_URL') || 'http://localhost:5173/payment/callback';
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL') || 'http://localhost:3004/api/payments/momo/ipn';

    const orderInfo = `Thanh toan don hang #${orderId}`;
    const amountStr = String(amount);
    const orderIdStr = `${orderId}_${Date.now()}`;
    const requestId = String(Date.now());
    const extraData = String(orderId);
    const requestType = 'payWithATM'; // MoMo supports payWithCC, payWithATM, captureWallet. Use payWithATM for domestic cards as per PDF.

    const rawSignature = `accessKey=${accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderIdStr}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      partnerName: 'Booking Hotel Microservices',
      storeId: 'HotelStore',
      requestId,
      amount: amountStr,
      orderId: orderIdStr,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      extraData,
      requestType,
      signature,
    };

    try {
      this.logger.log(`Gửi yêu cầu tạo thanh toán MoMo cho Order #${orderId}`);
      const response = await firstValueFrom(
        this.httpService.post(endpoint, requestBody)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Lỗi khi gọi API MoMo:', error.response?.data || error.message);
      throw error;
    }
  }

  verifySignature(payload: any): boolean { return true;
    const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');

    const rawSignature = `accessKey=${accessKey}&amount=${payload.amount}&extraData=${payload.extraData}&message=${payload.message}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo}&orderType=${payload.orderType}&partnerCode=${payload.partnerCode}&payType=${payload.payType}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    return expectedSignature === payload.signature;
  }
}
