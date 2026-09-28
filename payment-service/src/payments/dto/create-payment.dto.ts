import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/payment.entity';

export { PaymentMethod };

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bookingId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Số tiền thanh toán phải lớn hơn 0' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  @IsOptional()
  method?: PaymentMethod = PaymentMethod.TRANSFER;
}
