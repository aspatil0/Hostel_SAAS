import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMarketingPostDto } from './dto/create-marketing-post.dto.js';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, city?: string) {
    try {
      const posts = await (this.prisma as any).marketingPost.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (!search && (!city || city === 'all')) {
        return posts;
      }

      return posts.filter((post: any) => {
        const matchesSearch =
          !search ||
          post.propertyName.toLowerCase().includes(search.toLowerCase()) ||
          post.headline.toLowerCase().includes(search.toLowerCase()) ||
          post.city.toLowerCase().includes(search.toLowerCase());

        const matchesCity =
          !city || city === 'all' || post.city.toLowerCase() === city.toLowerCase();

        return matchesSearch && matchesCity;
      });
    } catch {
      // Return initial fallback data if table is initializing
      return [];
    }
  }

  async findLiveLandingPosts() {
    try {
      return await (this.prisma as any).marketingPost.findMany({
        where: { isLiveOnLandingPage: true },
        orderBy: { likes: 'desc' },
      });
    } catch {
      return [];
    }
  }

  async create(dto: CreateMarketingPostDto) {
    try {
      return await (this.prisma as any).marketingPost.create({
        data: {
          propertyId: dto.propertyId,
          propertyName: dto.propertyName,
          city: dto.city,
          address: dto.address,
          image: dto.image,
          headline: dto.headline,
          description: dto.description,
          startingPrice: dto.startingPrice,
          isLiveOnLandingPage: dto.isLiveOnLandingPage ?? true,
          whatsapp: dto.whatsapp,
          instagram: dto.instagram,
          facebook: dto.facebook,
          twitter: dto.twitter,
          likes: 0,
          views: 1,
          inquiries: 0,
        },
      });
    } catch (err: any) {
      throw new Error(`Failed to create marketing post: ${err.message}`);
    }
  }

  async toggleLanding(id: number) {
    const post = await (this.prisma as any).marketingPost.findUnique({
      where: { id },
    });

    if (!post) throw new NotFoundException(`Marketing post #${id} not found`);

    return (this.prisma as any).marketingPost.update({
      where: { id },
      data: { isLiveOnLandingPage: !post.isLiveOnLandingPage },
    });
  }

  async incrementLike(id: number, increment: boolean = true) {
    const post = await (this.prisma as any).marketingPost.findUnique({
      where: { id },
    });

    if (!post) throw new NotFoundException(`Marketing post #${id} not found`);

    const newLikes = increment ? post.likes + 1 : Math.max(0, post.likes - 1);

    return (this.prisma as any).marketingPost.update({
      where: { id },
      data: { likes: newLikes },
    });
  }

  async incrementView(id: number) {
    return (this.prisma as any).marketingPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async incrementInquiry(id: number) {
    return (this.prisma as any).marketingPost.update({
      where: { id },
      data: { inquiries: { increment: 1 } },
    });
  }
}
