import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CASH = 'CASH',          // Tiền mặt tại quầy
  CARD = 'CARD',          // Thẻ ngân hàng
  TRANSFER = 'TRANSFER',  // Chuyển khoản
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookingId: number;

  @Column()
  userId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.TRANSFER })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionId: string; // Mã giao dịch (nếu có)

  @CreateDateColumn()
  createdAt: Date;
}
