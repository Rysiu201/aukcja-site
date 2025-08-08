import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/ws', cors: { origin: '*' } })
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { auctionId: number }, @ConnectedSocket() client: Socket) {
    client.join(`auction:${data.auctionId}`);
  }

  emitPriceUpdate(auctionId: number, payload: { price: number; leaderId: number; endsAt: Date }) {
    this.server.to(`auction:${auctionId}`).emit('priceUpdate', payload);
  }
}
