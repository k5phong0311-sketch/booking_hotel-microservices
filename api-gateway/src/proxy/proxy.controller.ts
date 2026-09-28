import {
  Controller, All, Req, Res, UseGuards,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // ===== PUBLIC routes (không cần đăng nhập) =====
  @All('auth/*')
  proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.USER_SERVICE_URL);
  }

  @All('rooms')
  proxyRoomList(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.ROOM_SERVICE_URL);
  }

  @All('rooms/:id')
  proxyRoomDetail(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.ROOM_SERVICE_URL);
  }

  // ===== PROTECTED routes (cần JWT) =====
  @UseGuards(JwtAuthGuard)
  @All('users/*')
  proxyUsers(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.USER_SERVICE_URL);
  }

  @UseGuards(JwtAuthGuard)
  @All('bookings/*')
  proxyBookings(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.BOOKING_SERVICE_URL);
  }

  @UseGuards(JwtAuthGuard)
  @All('payments/*')
  proxyPayments(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.PAYMENT_SERVICE_URL);
  }

  @UseGuards(JwtAuthGuard)
  @All('reviews/*')
  proxyReviews(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.USER_SERVICE_URL);
  }
}
