import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware ghi log mỗi request vào API Gateway.
 * Format: [METHOD] /path - Status - Thời gian xử lý
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('APIGateway');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      const color = statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // đỏ nếu lỗi, xanh nếu OK
      this.logger.log(`${color}${method}\x1b[0m ${originalUrl} → ${statusCode} [${ms}ms]`);
    });

    next();
  }
}
