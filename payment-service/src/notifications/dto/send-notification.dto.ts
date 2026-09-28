import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';

export class SendNotificationDto {
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  bookingId?: number;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType = NotificationType.PAYMENT_SUCCESS;

  @IsString()
  @IsOptional()
  recipient?: string;

  @IsString()
  title: string;

  @IsString()
  content: string;
}
