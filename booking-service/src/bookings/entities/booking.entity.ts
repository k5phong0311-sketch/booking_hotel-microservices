import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roomId: number;

  @Column({ type: 'date' })
  checkIn: Date;

  @Column({ type: 'date' })
  checkOut: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;
}
