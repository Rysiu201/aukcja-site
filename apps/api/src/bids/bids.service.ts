import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const prisma = new PrismaClient();

@Injectable()
export class BidsService {
  constructor(private readonly realtime: RealtimeGateway) {}

  async placeBid(auctionId: number, userId: number, amount: number) {
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: { state: true },
      });
      if (!auction || auction.status !== 'ACTIVE') {
        throw new NotFoundException('Auction not found');
      }
      const currentPrice = Number(auction.state.currentPrice);
      const minIncrement = Number(auction.minIncrement);
      if (amount < currentPrice + minIncrement) {
        throw new BadRequestException('Bid too low');
      }
      let endsAt = auction.state.endsAt;
      const now = new Date();
      if (endsAt.getTime() - now.getTime() <= 60_000) {
        endsAt = new Date(endsAt.getTime() + 120_000);
      }
      const updated = await tx.auctionState.updateMany({
        where: { auctionId, version: auction.state.version },
        data: {
          currentPrice: amount,
          currentLeaderId: userId,
          endsAt,
          version: { increment: 1 },
        },
      });
      if (updated.count === 0) {
        throw new BadRequestException('Concurrent update');
      }
      await tx.bid.create({ data: { auctionId, userId, amount } });
      return { price: amount, leaderId: userId, endsAt };
    });
    this.realtime.emitPriceUpdate(auctionId, result);
    return result;
  }
}
