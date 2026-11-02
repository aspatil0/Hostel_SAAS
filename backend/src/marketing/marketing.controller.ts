import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MarketingService } from './marketing.service.js';
import { CreateMarketingPostDto } from './dto/create-marketing-post.dto.js';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('city') city?: string,
  ) {
    return this.marketingService.findAll(search, city);
  }

  @Get('landing')
  findLiveLandingPosts() {
    return this.marketingService.findLiveLandingPosts();
  }

  @Post()
  create(@Body() dto: CreateMarketingPostDto) {
    return this.marketingService.create(dto);
  }

  @Patch(':id/toggle-landing')
  toggleLanding(@Param('id', ParseIntPipe) id: number) {
    return this.marketingService.toggleLanding(id);
  }

  @Post(':id/like')
  incrementLike(
    @Param('id', ParseIntPipe) id: number,
    @Body('increment') increment?: boolean,
  ) {
    return this.marketingService.incrementLike(id, increment ?? true);
  }

  @Post(':id/view')
  incrementView(@Param('id', ParseIntPipe) id: number) {
    return this.marketingService.incrementView(id);
  }

  @Post(':id/inquiry')
  incrementInquiry(@Param('id', ParseIntPipe) id: number) {
    return this.marketingService.incrementInquiry(id);
  }
}
