import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Module({
  providers: [BidsService, RealtimeGateway],
  controllers: [BidsController],
})
export class BidsModule {}
