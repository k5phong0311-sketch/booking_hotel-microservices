import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, VersionColumn } from 'typeorm';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  discountPercentage: number;

  @Column()
  quantity: number;

  @Column({ default: 0 })
  usedCount: number;

  @CreateDateColumn()
  createdAt: Date;

  // Sử dụng Optimistic Locking để chống Race Condition khi nhiều người dùng voucher cùng lúc
  @VersionColumn()
  version: number;
}
