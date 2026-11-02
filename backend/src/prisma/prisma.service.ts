import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to MySQL database.');
    } catch (error: any) {
      this.logger.error(
        `Database connection failed: ${error.message}. Please check DATABASE_URL in backend/.env`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

