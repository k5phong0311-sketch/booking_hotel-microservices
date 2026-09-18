import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepo.create({
      ...dto,
      status: PaymentStatus.PENDING,
    });
    const saved = await this.paymentRepo.save(payment);

    // Giả lập xử lý thanh toán thành công
    await this.paymentRepo.update(saved.id, {
      status: PaymentStatus.SUCCESS,
      transactionId: `TXN-${Date.now()}`,
    });

    // Gọi booking-service để cập nhật trạng thái CONFIRMED
    try {
      await firstValueFrom(
        this.httpService.patch(
          `${process.env.BOOKING_SERVICE_URL}/api/bookings/${dto.bookingId}/status`,
          { status: 'CONFIRMED' },
          { timeout: 5000 },
        ),
      );
    } catch {
      // Log lỗi nhưng không throw để tránh rollback payment
      console.error(`Không thể cập nhật trạng thái booking #${dto.bookingId}`);
    }

    return this.paymentRepo.findOne({ where: { id: saved.id } });
  }

  async findByBooking(bookingId: number): Promise<Payment> {
    return this.paymentRepo.findOne({ where: { bookingId } });
  }
}
