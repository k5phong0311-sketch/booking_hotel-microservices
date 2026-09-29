import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum NotificationType {
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
}

export enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  bookingId: number;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.PAYMENT_SUCCESS })
  type: NotificationType;

  @Column()
  recipient: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.SENT })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;
}
