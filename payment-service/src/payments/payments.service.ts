import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
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
      paidAt: new Date(),
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

  async findAll(query: QueryPaymentDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepo.createQueryBuilder('payment');

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.method) {
      qb.andWhere('payment.method = :method', { method: query.method });
    }

    qb.orderBy('payment.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const payments = await this.paymentRepo.find();

    const totalTransactions = payments.length;
    let totalRevenue = 0;
    let totalRefunded = 0;

    const byStatus = {
      SUCCESS: 0,
      PENDING: 0,
      FAILED: 0,
      REFUNDED: 0,
      CANCELLED: 0,
    };

    const byMethod = {
      MOMO: { count: 0, revenue: 0 },
      CARD: { count: 0, revenue: 0 },
      TRANSFER: { count: 0, revenue: 0 },
      CASH: { count: 0, revenue: 0 },
    };

    for (const p of payments) {
      if (byStatus[p.status] !== undefined) {
        byStatus[p.status]++;
      }

      if (p.status === PaymentStatus.SUCCESS) {
        const amt = Number(p.amount) || 0;
        totalRevenue += amt;

        if (byMethod[p.method]) {
          byMethod[p.method].count++;
          byMethod[p.method].revenue += amt;
        }
      } else if (p.status === PaymentStatus.REFUNDED) {
        totalRefunded += Number(p.refundAmount || p.amount) || 0;
      }
    }

    return {
      totalTransactions,
      totalRevenue,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded,
      byStatus,
      byMethod,
    };
  }

  async refund(id: number, dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new HttpException(
        `Chỉ có thể hoàn tiền cho giao dịch thành công (hiện tại: ${payment.status})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const refundAmount = dto.amount !== undefined ? dto.amount : Number(payment.amount);
    if (refundAmount > Number(payment.amount)) {
      throw new HttpException(
        'Số tiền hoàn lại không thể lớn hơn số tiền thanh toán ban đầu',
        HttpStatus.BAD_REQUEST,
      );
    }

    const refundReason = dto.reason || 'Khách hủy đặt phòng / Hoàn tiền theo chính sách';

    await this.paymentRepo.update(id, {
      status: PaymentStatus.REFUNDED,
      refundAmount,
      refundReason,
      refundedAt: new Date(),
    });

    const updated = await this.findOne(id);

    // 1. Gọi booking-service để đổi trạng thái booking sang CANCELLED
    try {
      const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
      await firstValueFrom(
        this.httpService.patch(
          `${bookingServiceUrl}/api/bookings/${payment.bookingId}/status`,
          { status: 'CANCELLED' },
          { timeout: 5000 },
        ),
      );
      this.logger.log(`Đã cập nhật trạng thái booking #${payment.bookingId} -> CANCELLED sau khi hoàn tiền`);
    } catch (err) {
      this.logger.warn(`Không thể cập nhật booking #${payment.bookingId} sang CANCELLED: ${err.message}`);
    }

    // 2. Gửi email / notification thông báo hoàn tiền
    try {
      await this.notificationsService.sendPaymentRefund(
        payment.userId,
        payment.bookingId,
        refundAmount,
        refundReason,
      );
    } catch (err) {
      this.logger.error(`Không thể gửi notification hoàn tiền cho user #${payment.userId}: ${err.message}`);
    }

    return updated;
  }

  async cancel(id: number, reason?: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new HttpException(
        `Chỉ có thể hủy giao dịch đang chờ xử lý (hiện tại: ${payment.status})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.paymentRepo.update(id, {
      status: PaymentStatus.CANCELLED,
      notes: reason || 'Khách hủy giao dịch trước khi thanh toán',
    });

    return this.findOne(id);
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
