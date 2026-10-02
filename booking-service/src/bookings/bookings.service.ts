import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly httpService: HttpService,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    
    // Bước 1: Kiểm tra Giao thoa ngày (Date Overlap) trong DB nội bộ
    // Logic: Có booking nào (PENDING hoặc CONFIRMED) mà (existing_checkOut > new_checkIn) VÀ (existing_checkIn < new_checkOut) không?
    const overlappingBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId: dto.roomId })
      .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] })
      .andWhere('booking.checkOut > :checkIn', { checkIn })
      .andWhere('booking.checkIn < :checkOut', { checkOut })
      .getMany();

    if (overlappingBookings.length > 0) {
      throw new HttpException('Phòng đã được đặt trong khoảng thời gian này!', HttpStatus.CONFLICT);
    }

    // Bước 2: Lấy giá trị tiền từ Room Service
    let pricePerNight = 500000;
    try {
      const roomRes = await firstValueFrom(
        this.httpService.get(
          `${process.env.ROOM_SERVICE_URL}/api/rooms/${dto.roomId}/availability`,
          { timeout: 5000 },
        ),
      );
      if (!roomRes.data.available) {
         // Fallback cho cờ isAvailable tĩnh của admin (VD: Đang sửa chữa)
        throw new HttpException('Phòng hiện đang tạm khóa hoặc sửa chữa', HttpStatus.CONFLICT);
      }
      pricePerNight = roomRes.data.pricePerNight || 500000;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Room Service không khả dụng', HttpStatus.BAD_GATEWAY);
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) throw new HttpException('Ngày trả phòng phải sau ngày nhận', HttpStatus.BAD_REQUEST);

    // Bước 3: Tạo booking PENDING (Đây chính là Soft-Hold)
    const booking = this.bookingRepo.create({
      ...dto,
      totalPrice: nights * pricePerNight,
      status: BookingStatus.PENDING,
    });
    const saved = await this.bookingRepo.save(booking);

    // Bước 4: Gọi payment-service để sinh link MoMo/Thanh toán
    try {
      await firstValueFrom(
        this.httpService.post(
          `${process.env.PAYMENT_SERVICE_URL}/api/payments`,
          { bookingId: saved.id, userId: dto.userId, amount: saved.totalPrice },
          { timeout: 5000 },
        ),
      );
    } catch {
      await this.bookingRepo.update(saved.id, { status: BookingStatus.FAILED });
      throw new HttpException('Khởi tạo thanh toán thất bại, vui lòng thử lại', HttpStatus.PAYMENT_REQUIRED);
    }

    return saved;
  }

  // --- CRON JOB: Dọn dẹp Soft-hold ---
  // Chạy mỗi phút một lần
  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredHolds() {
    // 15 phút trước
    const expirationTime = new Date(Date.now() - 15 * 60 * 1000);

    const expiredBookings = await this.bookingRepo.find({
      where: {
        status: BookingStatus.PENDING,
        createdAt: LessThan(expirationTime),
      },
    });

    if (expiredBookings.length > 0) {
      const ids = expiredBookings.map(b => b.id);
      await this.bookingRepo.update(ids, { status: BookingStatus.FAILED });
      this.logger.log(`Đã giải phóng (hủy) ${ids.length} đơn đặt phòng quá 15 phút không thanh toán: ${ids.join(', ')}`);
      
      // Phase 4: Nếu có luồng Rollback Voucher, sẽ gọi API sang Notification/Payment Service ở đây.
    }
  }

  async findByUser(userId: number): Promise<Booking[]> {
    return this.bookingRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new HttpException('Đơn đặt phòng không tìm thấy', HttpStatus.NOT_FOUND);
    return booking;
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    await this.bookingRepo.update(id, { status });
    return this.findOne(id);
  }

  async cancel(id: number): Promise<Booking> {
    return this.updateStatus(id, BookingStatus.CANCELED);
  }
}
