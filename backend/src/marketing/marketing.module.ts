import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller.js';
import { MarketingService } from './marketing.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}
