import { IsNumber, IsEnum, Min, IsOptional } from 'class-validator';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  MOMO = 'MOMO',
}

export class CreatePaymentDto {
  @IsNumber()
  bookingId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}

