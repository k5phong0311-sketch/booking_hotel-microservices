import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Số vòng hash bcrypt — càng cao càng an toàn nhưng chậm hơn
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại chưa
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email này đã được đăng ký. Vui lòng dùng email khác.');
    }

    // Validate định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new ConflictException('Định dạng email không hợp lệ.');
    }

    // Hash password trước khi lưu vào DB
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });
    const saved = await this.userRepo.save(user);

    // Tạo JWT token ngay sau khi đăng ký
    const token = this._signToken(saved);

    return {
      access_token: token,
      user: this._sanitizeUser(saved),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    return {
      access_token: this._signToken(user),
      user: this._sanitizeUser(user),
    };
  }

  // Tìm user theo email — dùng nội bộ
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  // Tạo JWT payload và sign token
  private _signToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  // Loại bỏ password trước khi trả về client
  private _sanitizeUser(user: User) {
    const { password, ...rest } = user as any;
    return rest;
  }
}
