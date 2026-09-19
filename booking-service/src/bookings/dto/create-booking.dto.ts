import { IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  roomId: number;

  // Định dạng: YYYY-MM-DD
  @IsDateString({}, { message: 'checkIn phải có định dạng YYYY-MM-DD' })
  checkIn: string;

  @IsDateString({}, { message: 'checkOut phải có định dạng YYYY-MM-DD' })
  checkOut: string;
}
