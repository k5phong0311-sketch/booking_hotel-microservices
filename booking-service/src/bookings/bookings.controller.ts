import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './entities/booking.entity';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /api/bookings — Tạo đơn đặt phòng mới
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // GET /api/bookings/user/:userId — Lịch sử đặt phòng của 1 user
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.bookingsService.findByUser(userId);
  }

  // GET /api/bookings/:id — Chi tiết 1 đơn đặt phòng
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  // PATCH /api/bookings/:id/confirm — Admin xác nhận đơn
  @Patch(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.updateStatus(id, BookingStatus.CONFIRMED);
  }

  // PATCH /api/bookings/:id/cancel — Hủy đơn đặt phòng
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(id);
  }

  // PATCH /api/bookings/:id/status — Cập nhật trạng thái (dùng bởi Payment Service)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingsService.updateStatus(id, status);
  }
}
