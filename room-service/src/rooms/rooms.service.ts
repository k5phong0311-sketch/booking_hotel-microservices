import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.roomRepo.find();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Phòng #${id} không tìm thấy`);
    return room;
  }

  async checkAvailability(id: number): Promise<{ available: boolean }> {
    const room = await this.findOne(id);
    return { available: room.isAvailable };
  }

  async update(id: number, data: Partial<Room>): Promise<Room> {
    await this.findOne(id);
    await this.roomRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepo.remove(room);
  }
}
