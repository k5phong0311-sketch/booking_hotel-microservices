import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async forward(req: Request, res: Response, targetUrl: string) {
    const path = req.url;
    const url = `${targetUrl}${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method as any,
          url,
          data: req.body,
          headers: {
            Authorization: req.headers['authorization'],
            'Content-Type': 'application/json',
          },
          timeout: 5000, // 5 giây timeout
        }),
      );
      return res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || HttpStatus.BAD_GATEWAY;
      const message = error.response?.data?.message || 'Service unavailable';
      throw new HttpException(message, status);
    }
  }
}
