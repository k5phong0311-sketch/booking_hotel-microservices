import {
  Controller, Get, Post, Patch,
  Param, Body, ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './entities/booking.entity';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.bookingsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(id);
  }
}
