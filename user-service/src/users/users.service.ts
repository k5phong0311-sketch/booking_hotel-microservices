import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepo.find();
    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} không tìm thấy`);
    const { password, ...result } = user;
    return result;
  }

  async update(id: number, data: Partial<User>): Promise<Omit<User, 'password'>> {
    await this.findOne(id);
    await this.userRepo.update(id, data);
    return this.findOne(id);
  }
}
