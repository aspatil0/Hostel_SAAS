import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PropertiesModule } from './properties/properties.module.js';
import { AdminsModule } from './admins/admins.module.js';
import { MarketingModule } from './marketing/marketing.module.js';
import { PropertyPortalModule } from './property-portal/property-portal.module.js';
import { StudentModule } from './student/student.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    PropertiesModule,
    AdminsModule,
    MarketingModule,
    PropertyPortalModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
