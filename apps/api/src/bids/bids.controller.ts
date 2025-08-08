import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('auctions/:auctionId/bids')
export class BidsController {
  constructor(private readonly service: BidsService) {}

  @UseGuards(AuthGuard)
  @Post()
  placeBid(@Param('auctionId') auctionId: string, @Body('amount') amount: number, @Req() req: any) {
    return this.service.placeBid(+auctionId, req.user.id, Number(amount));
  }
}
