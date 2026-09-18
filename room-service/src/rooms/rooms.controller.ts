import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // POST /api/rooms — Tạo phòng mới
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  // GET /api/rooms — Danh sách phòng trống
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  // GET /api/rooms/:id — Chi tiết 1 phòng
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  // GET /api/rooms/:id/availability — Kiểm tra phòng có trống không (dùng nội bộ)
  @Get(':id/availability')
  checkAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.checkAvailability(id);
  }

  // PATCH /api/rooms/:id — Cập nhật thông tin phòng
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.roomsService.update(id, body);
  }

  // PATCH /api/rooms/:id/toggle-availability — Admin bật/tắt trạng thái phòng
  @Patch(':id/toggle-availability')
  toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.toggleAvailability(id);
  }

  // DELETE /api/rooms/:id — Xóa phòng
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }
}
