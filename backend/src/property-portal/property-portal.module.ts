import { Module } from '@nestjs/common';
import { PropertyPortalController } from './property-portal.controller.js';
import { PropertyPortalService } from './property-portal.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PropertyPortalController],
  providers: [PropertyPortalService],
  exports: [PropertyPortalService],
})
export class PropertyPortalModule {}
