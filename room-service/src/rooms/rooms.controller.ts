import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // POST /api/rooms — Tạo phòng mới (Admin)
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  // GET /api/rooms?type=SUITE — Danh sách phòng trống, lọc theo loại
  @Get()
  findAll(@Query('type') type?: string) {
    return this.roomsService.findAll(type);
  }

  // GET /api/rooms/price?min=500000&max=2000000 — Lọc theo khoảng giá
  @Get('price')
  findByPrice(
    @Query('min') min: string,
    @Query('max') max: string,
  ) {
    return this.roomsService.findByPriceRange(Number(min) || 0, Number(max) || 99999999);
  }

  // GET /api/rooms/:id — Chi tiết 1 phòng
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  // GET /api/rooms/:id/availability — Kiểm tra trạng thái phòng (nội bộ)
  @Get(':id/availability')
  checkAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.checkAvailability(id);
  }

  // PATCH /api/rooms/:id — Cập nhật thông tin phòng
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.roomsService.update(id, body);
  }

  // PATCH /api/rooms/:id/toggle-availability — Bật/tắt trạng thái phòng
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
