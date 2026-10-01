import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { NotificationsModule } from '../notifications/notifications.module';

import { MomoService } from './momo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), HttpModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MomoService],
  exports: [PaymentsService, MomoService],
})
export class PaymentsModule {}
