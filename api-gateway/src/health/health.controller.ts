import { Controller, Get } from '@nestjs/common';

/**
 * Health Check — Kiểm tra API Gateway có đang hoạt động không.
 * Endpoint: GET /health
 * Dùng cho: Docker health check, monitoring tools, load balancer
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
