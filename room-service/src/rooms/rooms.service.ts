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

  // Lấy tất cả phòng còn trống, có thể lọc theo loại phòng
  async findAll(type?: string): Promise<Room[]> {
    const query = this.roomRepo.createQueryBuilder('room')
      .where('room.isAvailable = :isAvailable', { isAvailable: true });

    if (type) {
      query.andWhere('room.type = :type', { type: type.toUpperCase() });
    }

    return query.orderBy('room.pricePerNight', 'ASC').getMany();
  }

  // Lọc phòng theo khoảng giá
  async findByPriceRange(min: number, max: number): Promise<Room[]> {
    return this.roomRepo.createQueryBuilder('room')
      .where('room.isAvailable = true')
      .andWhere('room.pricePerNight BETWEEN :min AND :max', { min, max })
      .orderBy('room.pricePerNight', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Phòng #${id} không tìm thấy`);
    return room;
  }

  // Kiểm tra phòng có trống không, trả về cả giá để booking service dùng
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
    await this.findOne(id); // validate tồn tại
    await this.roomRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const room = await this.findOne(id);
    await this.roomRepo.remove(room);
    return { message: `Đã xóa phòng #${id} thành công` };
  }
}
