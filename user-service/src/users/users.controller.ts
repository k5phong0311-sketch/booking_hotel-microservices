import { Controller, Get, Patch, Param, Body, ParseIntPipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users — Lấy tất cả user (Admin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/me — Lấy thông tin user hiện tại từ JWT payload
  @Get('me')
  getMe(@Req() req: any) {
    // userId được gắn vào request bởi JwtAuthGuard ở API Gateway
    const userId = req.user?.sub || req.headers['x-user-id'];
    return this.usersService.findOne(Number(userId));
  }

  // GET /api/users/:id — Lấy thông tin 1 user theo id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/users/:id — Cập nhật thông tin cá nhân
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }
}
