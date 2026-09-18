import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    // Bước 1: Kiểm tra phòng còn trống không
    try {
      const roomRes = await firstValueFrom(
        this.httpService.get(
          `${process.env.ROOM_SERVICE_URL}/api/rooms/${dto.roomId}/availability`,
          { timeout: 5000 },
        ),
      );
      if (!roomRes.data.available) {
        throw new HttpException('Phòng đã được đặt', HttpStatus.CONFLICT);
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Room Service không khả dụng', HttpStatus.BAD_GATEWAY);
    }

    // Bước 2: Tính tiền
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Bước 3: Tạo booking PENDING
    const booking = this.bookingRepo.create({
      ...dto,
      totalPrice: nights * 500000, // Tạm thời hardcode, sẽ lấy từ room-service
      status: BookingStatus.PENDING,
    });
    const saved = await this.bookingRepo.save(booking);

    // Bước 4: Gọi payment-service
    try {
      await firstValueFrom(
        this.httpService.post(
          `${process.env.PAYMENT_SERVICE_URL}/api/payments`,
          { bookingId: saved.id, userId: dto.userId, amount: saved.totalPrice },
          { timeout: 5000 },
        ),
      );
    } catch {
      // Nếu payment lỗi -> cập nhật booking thành FAILED
      await this.bookingRepo.update(saved.id, { status: BookingStatus.FAILED });
      throw new HttpException('Thanh toán thất bại, vui lòng thử lại', HttpStatus.PAYMENT_REQUIRED);
    }

    return saved;
  }

  async findByUser(userId: number): Promise<Booking[]> {
    return this.bookingRepo.find({ where: { userId } });
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
