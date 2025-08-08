import { Injectable } from '@nestjs/common';
import { PrismaClient, AuctionStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';

const prisma = new PrismaClient();

@Injectable()
export class AuctionsService {
  constructor(private readonly notifications: NotificationsService) {}
  findAll() {
    return prisma.auction.findMany({
      where: { status: AuctionStatus.ACTIVE },
      orderBy: { endAt: 'asc' },
      include: { state: true },
    });
  }

  findOne(id: number) {
    return prisma.auction.findUnique({ where: { id }, include: { state: true } });
  }

  create(data: any, imagePath?: string) {
    return prisma.auction.create({
      data: {
        title: data.title,
        description: data.description,
        imagePath,
        status: AuctionStatus.ACTIVE,
        startPrice: data.startPrice,
        minIncrement: data.minIncrement,
        startAt: data.startAt,
        endAt: data.endAt,
        state: {
          create: {
            currentPrice: data.startPrice,
            endsAt: data.endAt,
          },
        },
      },
    });
  }

  update(id: number, data: any) {
    return prisma.auction.update({ where: { id }, data });
  }

  async close(id: number) {
    const [updated] = await prisma.$transaction([
      prisma.auction.update({
        where: { id },
        data: { status: AuctionStatus.ENDED },
      }),
      prisma.auditLog.create({
        data: {
          action: 'AUCTION_ENDED',
          entityType: 'Auction',
          entityId: id,
          details: {},
          ip: '',
          ua: '',
        },
      }),
    ]);

    const winner = await prisma.bid.findFirst({
      where: { auctionId: id },
      orderBy: { amount: 'desc' },
      include: { user: true },
    });
    if (winner?.user?.email) {
      await this.notifications.sendWinnerEmail(
        winner.user.email,
        updated.title,
        winner.amount,
      );
    }
    return updated;
  }

  @Cron('*/30 * * * * *')
  async closeExpired() {
    const now = new Date();
    const auctions = await prisma.auction.findMany({
      where: { status: AuctionStatus.ACTIVE, endAt: { lte: now } },
    });
    for (const auction of auctions) {
      const [updated] = await prisma.$transaction([
        prisma.auction.update({
          where: { id: auction.id },
          data: { status: AuctionStatus.ENDED },
        }),
        prisma.auditLog.create({
          data: {
            action: 'AUCTION_ENDED',
            entityType: 'Auction',
            entityId: auction.id,
            details: {},
            ip: '',
            ua: '',
          },
        }),
      ]);

      const winner = await prisma.bid.findFirst({
        where: { auctionId: auction.id },
        orderBy: { amount: 'desc' },
        include: { user: true },
      });
      if (winner?.user?.email) {
        await this.notifications.sendWinnerEmail(
          winner.user.email,
          updated.title,
          winner.amount,
        );
      }
    }
  }
}
