import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🚀 Booking Service is running on: http://localhost:${port}/api`);
}
bootstrap();
