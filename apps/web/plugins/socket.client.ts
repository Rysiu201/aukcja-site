import { io, Socket } from 'socket.io-client';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const socket: Socket = io(config.public.wsUrl, {
    transports: ['websocket'],
  });

  nuxtApp.provide('socket', socket);
  nuxtApp.provide('joinRoom', (id: number) => {
    socket.emit('join', { auctionId: id });
  });
});
