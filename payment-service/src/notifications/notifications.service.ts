import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from './entities/notification.entity';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async send(dto: SendNotificationDto): Promise<Notification> {
    let recipient = dto.recipient;

    // Nếu chưa có email, thử lấy từ user-service
    if (!recipient && dto.userId) {
      try {
        const userServiceUrl = this.configService.get(
          'USER_SERVICE_URL',
          'http://localhost:3001',
        );
        const res = await firstValueFrom(
          this.httpService.get(`${userServiceUrl}/api/users/${dto.userId}`, {
            timeout: 3000,
          }),
        );
        recipient = res.data?.email || res.data?.user?.email;
      } catch {
        this.logger.warn(
          `Không thể lấy thông tin email của user #${dto.userId} từ User Service`,
        );
      }
    }

    if (!recipient) {
      recipient = `user_${dto.userId}@bookinghotel.local`;
    }

    // Mô phỏng / thực hiện gửi email thông báo
    this.logger.log(`\n================= [EMAIL NOTIFICATION] =================\n` +
      `To: ${recipient}\n` +
      `Subject: ${dto.title}\n` +
      `Content:\n${dto.content}\n` +
      `========================================================\n`);

    const notification = this.notificationRepo.create({
      userId: dto.userId,
      bookingId: dto.bookingId,
      type: dto.type || NotificationType.PAYMENT_SUCCESS,
      recipient,
      title: dto.title,
      content: dto.content,
      status: NotificationStatus.SENT,
    });

    return this.notificationRepo.save(notification);
  }

  async sendPaymentSuccess(
    userId: number,
    bookingId: number,
    amount: number,
    transactionId: string,
  ): Promise<Notification> {
    return this.send({
      userId,
      bookingId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: `[BookingHotel] Xác nhận thanh toán thành công cho đơn #${bookingId}`,
      content:
        `Xin chào,\n\n` +
        `Bạn đã thanh toán thành công cho đơn đặt phòng #${bookingId}.\n` +
        `Số tiền: ${Number(amount).toLocaleString('vi-VN')} VNĐ\n` +
        `Mã giao dịch: ${transactionId}\n` +
        `Trạng thái đặt phòng: ĐÃ XÁC NHẬN (CONFIRMED).\n\n` +
        `Cảm ơn bạn đã sử dụng dịch vụ của BookingHotel!`,
    });
  }

  async sendPaymentFailed(
    userId: number,
    bookingId: number,
    amount: number,
    reason = 'Giao dịch bị từ chối hoặc quá hạn',
  ): Promise<Notification> {
    return this.send({
      userId,
      bookingId,
      type: NotificationType.PAYMENT_FAILED,
      title: `[BookingHotel] Thanh toán thất bại cho đơn #${bookingId}`,
      content:
        `Xin chào,\n\n` +
        `Thanh toán cho đơn đặt phòng #${bookingId} của bạn đã thất bại.\n` +
        `Số tiền: ${Number(amount).toLocaleString('vi-VN')} VNĐ\n` +
        `Lý do: ${reason}\n\n` +
        `Vui lòng thử lại hoặc chọn phương thức thanh toán khác!`,
    });
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByBooking(bookingId: number): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }
}
