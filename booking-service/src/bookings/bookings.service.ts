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
    // Bước 1: Gọi Room Service kiểm tra phòng còn trống + lấy giá
    let pricePerNight: number;
    try {
      const roomRes = await firstValueFrom(
        this.httpService.get(
          `${process.env.ROOM_SERVICE_URL}/api/rooms/${dto.roomId}/availability`,
          { timeout: 5000 },
        ),
      );
      if (!roomRes.data.available) {
        throw new HttpException('Phòng đã được đặt, vui lòng chọn phòng khác', HttpStatus.CONFLICT);
      }
      pricePerNight = roomRes.data.pricePerNight;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Room Service không khả dụng, thử lại sau', HttpStatus.BAD_GATEWAY);
    }

    // Bước 2: Tính tổng tiền theo số đêm thực tế
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
      throw new HttpException('Ngày trả phòng phải sau ngày nhận phòng', HttpStatus.BAD_REQUEST);
    }
    const totalPrice = nights * pricePerNight;

    // Bước 3: Tạo booking với trạng thái PENDING
    const booking = this.bookingRepo.create({
      ...dto,
      checkIn,
      checkOut,
      totalPrice,
      status: BookingStatus.PENDING,
    });
    const saved = await this.bookingRepo.save(booking);

    // Bước 4: Gọi Payment Service
    try {
      await firstValueFrom(
        this.httpService.post(
          `${process.env.PAYMENT_SERVICE_URL}/api/payments`,
          { bookingId: saved.id, userId: dto.userId, amount: totalPrice },
          { timeout: 5000 },
        ),
      );
    } catch {
      // Payment lỗi → Compensating: cập nhật booking thành FAILED
      await this.bookingRepo.update(saved.id, { status: BookingStatus.FAILED });
      throw new HttpException(
        'Thanh toán thất bại. Đơn đặt phòng đã bị hủy, vui lòng thử lại.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return this.findOne(saved.id);
  }

  async findByUser(userId: number): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new HttpException('Đơn đặt phòng không tìm thấy', HttpStatus.NOT_FOUND);
    return booking;
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    await this.findOne(id);
    await this.bookingRepo.update(id, { status });
    return this.findOne(id);
  }

  async cancel(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status === BookingStatus.CONFIRMED) {
      // Nếu đã confirmed thì cần mở lại phòng
      try {
        await firstValueFrom(
          this.httpService.patch(
            `${process.env.ROOM_SERVICE_URL}/api/rooms/${booking.roomId}/toggle-availability`,
            {},
            { timeout: 5000 },
          ),
        );
      } catch {
        console.warn(`Không thể mở lại trạng thái phòng #${booking.roomId}`);
      }
    }
    return this.updateStatus(id, BookingStatus.CANCELED);
  }
}
