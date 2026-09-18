import {
  Controller, All, Req, Res, HttpException,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Route tới user-service
  @All('auth/*')
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.USER_SERVICE_URL);
  }

  @All('users/*')
  async proxyUsers(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.USER_SERVICE_URL);
  }

  // Route tới room-service
  @All('rooms/*')
  async proxyRooms(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.ROOM_SERVICE_URL);
  }

  // Route tới booking-service
  @All('bookings/*')
  async proxyBookings(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.BOOKING_SERVICE_URL);
  }

  // Route tới payment-service
  @All('payments/*')
  async proxyPayments(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, process.env.PAYMENT_SERVICE_URL);
  }
}
