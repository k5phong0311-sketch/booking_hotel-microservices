import { IsNumber, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  roomId: number;

  @IsDateString()
  checkIn: string; // Format: YYYY-MM-DD

  @IsDateString()
  checkOut: string; // Format: YYYY-MM-DD
}
