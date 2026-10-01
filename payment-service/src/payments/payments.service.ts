import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly httpService: HttpService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepo.create({
      ...dto,
      method: dto.method || PaymentMethod.TRANSFER,
      status: PaymentStatus.PENDING,
    });
    const saved = await this.paymentRepo.save(payment);

    // Nếu chọn thanh toán MOMO thì giữ trạng thái PENDING
    if (dto.method === PaymentMethod.MOMO) {
      return saved;
    }

    // Các phương thức khác (Tiền mặt/Chuyển khoản thủ công) thì giả lập SUCCESS ngay
    return this.handlePaymentSuccess(saved.id, `TXN-${Date.now()}`);
  }

  async updateStatus(paymentId: number, statusStr: string, transactionId: string) {
    const payment = await this.findOne(paymentId);
    
    if (payment.status === PaymentStatus.SUCCESS) {
      return payment; // Đã xử lý rồi
    }

    if (statusStr === 'SUCCESS') {
      return this.handlePaymentSuccess(payment.id, transactionId);
    } else {
      await this.paymentRepo.update(payment.id, {
        status: PaymentStatus.FAILED,
        transactionId,
      });
      return this.findOne(payment.id);
    }
  }

  private async handlePaymentSuccess(paymentId: number, transactionId: string): Promise<Payment> {
    await this.paymentRepo.update(paymentId, {
      status: PaymentStatus.SUCCESS,
      transactionId,
    });

    const payment = await this.findOne(paymentId);

    // 1. Gọi booking-service để cập nhật trạng thái đơn đặt phòng thành CONFIRMED
    try {
      const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
      await firstValueFrom(
        this.httpService.patch(
          `${bookingServiceUrl}/api/bookings/${payment.bookingId}/status`,
          { status: 'CONFIRMED' },
          { timeout: 5000 },
        ),
      );
      this.logger.log(`Đã cập nhật trạng thái booking #${payment.bookingId} -> CONFIRMED`);
    } catch (err) {
      this.logger.error(`Không thể cập nhật trạng thái booking #${payment.bookingId}: ${err.message}`);
    }

    // 2. Gửi email / notification xác nhận thanh toán thành công
    try {
      await this.notificationsService.sendPaymentSuccess(
        payment.userId,
        payment.bookingId,
        payment.amount,
        transactionId,
      );
    } catch (err) {
      this.logger.error(`Không thể gửi notification cho user #${payment.userId}: ${err.message}`);
    }

    return payment;
  }

  async findByBooking(bookingId: number): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { bookingId } });
    if (!payment) {
      throw new HttpException(
        `Không tìm thấy giao dịch thanh toán cho booking #${bookingId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return payment;
  }

  async findByUser(userId: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) {
      throw new HttpException('Giao dịch không tồn tại', HttpStatus.NOT_FOUND);
    }
    return payment;
  }
}
