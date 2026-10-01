import { IsString, IsNumber, IsEnum, IsOptional, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

// Các loại phòng được hỗ trợ
export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE  = 'SUITE',
  DELUXE = 'DELUXE',
}

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsEnum(RoomType, { message: 'Loại phòng phải là SINGLE | DOUBLE | SUITE | DELUXE' })
  type: RoomType;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Giá phòng phải lớn hơn 0' })
  pricePerNight: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'imageUrl phải là URL hợp lệ' })
  imageUrl?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Số tầng phải lớn hơn 0' })
  floor: number;
}
