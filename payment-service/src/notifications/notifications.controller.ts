import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // POST /api/notifications/send — Gửi thông báo thủ công
  @Post('send')
  send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.send(dto);
  }

  // GET /api/notifications/user/:userId/unread-count — Đếm số thông báo chưa đọc
  @Get('user/:userId/unread-count')
  getUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  // GET /api/notifications/user/:userId — Lấy danh sách thông báo của user
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.findByUser(userId);
  }

  // GET /api/notifications/booking/:bookingId — Thông báo liên quan đến booking
  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.notificationsService.findByBooking(bookingId);
  }

  // PATCH /api/notifications/:id/read — Đánh dấu thông báo đã đọc
  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }
}
