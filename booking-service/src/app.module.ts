import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'hotel_user'),
        password: config.get('DB_PASSWORD', 'hotel_password'),
        database: config.get('DB_NAME', 'booking_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    BookingsModule,
  ],
})
export class AppModule {}
