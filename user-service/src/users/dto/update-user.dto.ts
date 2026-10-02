import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'H\u1ecd t\u00ean kh\u00f4ng \u0111\u01b0\u1ee3c qu\u00e1 100 k\u00fd t\u1ef1' })
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  role?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'M\u1eadt kh\u1ea9u m\u1edbi ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t 6 k\u00fd t\u1ef1' })
  newPassword: string;
}
