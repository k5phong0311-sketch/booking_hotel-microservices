import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { RoomType } from '../entities/room.entity';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsNumber()
  pricePerNight: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  floor: number;
}
