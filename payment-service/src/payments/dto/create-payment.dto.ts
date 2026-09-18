import { IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  bookingId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  amount: number;
}
