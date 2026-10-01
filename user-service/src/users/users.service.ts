import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
    return users.map(u => this._exclude(u));
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Người dùng #${id} không tồn tại`);
    return this._exclude(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Người dùng #${id} không tồn tại`);

    // Chỉ cập nhật những field được cung cấp
    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone;

    const updated = await this.userRepo.save(user);
    return this._exclude(updated);
  }

  // Loại bỏ password khỏi response
  private _exclude(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user as any;
    return rest;
  }
}
