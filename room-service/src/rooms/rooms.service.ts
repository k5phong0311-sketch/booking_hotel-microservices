import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
  ) {}

  async create(dto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepo.create(dto);
    return this.roomRepo.save(room);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepo.find({ where: { isAvailable: true } });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Phòng #${id} không tìm thấy`);
    return room;
  }

  // Kiểm tra phòng có trống không (dựa vào isAvailable)
  async checkAvailability(id: number): Promise<{ available: boolean; pricePerNight: number }> {
    const room = await this.findOne(id);
    return {
      available: room.isAvailable,
      pricePerNight: Number(room.pricePerNight),
    };
  }

  // Admin bật/tắt trạng thái phòng
  async toggleAvailability(id: number): Promise<Room> {
    const room = await this.findOne(id);
    await this.roomRepo.update(id, { isAvailable: !room.isAvailable });
    return this.findOne(id);
  }

  async update(id: number, data: Partial<Room>): Promise<Room> {
    await this.findOne(id);
    await this.roomRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const room = await this.findOne(id);
    await this.roomRepo.remove(room);
    return { message: `Đã xóa phòng #${id}` };
  }
}
