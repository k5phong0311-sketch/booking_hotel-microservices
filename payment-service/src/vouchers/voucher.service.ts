import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Voucher } from './voucher.entity';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    private readonly dataSource: DataSource,
  ) {}

  async createBroadcast(code: string, discountPercentage: number, quantity: number): Promise<Voucher> {
    const voucher = this.voucherRepo.create({ code, discountPercentage, quantity });
    const saved = await this.voucherRepo.save(voucher);
    
    // TODO: Gửi Notification tới tất cả user thông qua NotificationService hoặc Gateway
    this.logger.log(`[BROADCAST] Đã phát hành ${quantity} Voucher ${code} (-${discountPercentage}%)`);
    return saved;
  }

  // Khách hàng apply Voucher lúc thanh toán
  async applyVoucher(code: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED'); // Pessimistic Lock

    try {
      // Dùng Pessimistic Read/Write Lock để chặn đứng Race Condition (Đụng độ đồng thời)
      const voucher = await queryRunner.manager
        .createQueryBuilder(Voucher, 'voucher')
        .setLock('pessimistic_write')
        .where('voucher.code = :code', { code })
        .getOne();

      if (!voucher) {
        throw new HttpException('Voucher không tồn tại', HttpStatus.NOT_FOUND);
      }

      if (voucher.quantity - voucher.usedCount <= 0) {
        // Rollback nếu hết số lượng
        throw new HttpException('Voucher đã hết lượt sử dụng (Rollback)', HttpStatus.GONE);
      }

      // Trừ kho
      voucher.usedCount += 1;
      await queryRunner.manager.save(voucher);
      
      await queryRunner.commitTransaction();
      this.logger.log(`Voucher ${code} applied. Remaining: ${voucher.quantity - voucher.usedCount}`);
      return true;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.warn(`Voucher ${code} failed to apply. Rolled back.`);
      if (err instanceof HttpException) throw err;
      throw new HttpException('Lỗi hệ thống khi dùng Voucher', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }
}
