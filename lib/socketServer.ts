import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

declare global {
  var io: SocketIOServer | undefined;
}

export function initSocketServer(server: HTTPServer) {
  if (!global.io) {
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
      },
      path: '/socket.io/',
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.io] Client connected: ${socket.id}`);

      // Client joins customer-specific ticket room
      socket.on('join:ticket', (ticketId: string) => {
        socket.join(`ticket-${ticketId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined ticket-${ticketId}`);
      });

      // Staff joins counter room
      socket.on('join:counter', (counterId: string) => {
        socket.join(`counter-${counterId}`);
        socket.join('counter-room');
        console.log(`[Socket.io] Socket ${socket.id} joined counter-${counterId}`);
      });

      // TV Display joins kiosk room
      socket.on('join:tv', () => {
        socket.join('tv-room');
        console.log(`[Socket.io] Socket ${socket.id} joined tv-room`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      });
    });

    global.io = io;
    console.log('[Socket.io] Real-time engine initialized successfully.');
  }

  return global.io;
}

export function emitSocketEvent(event: string, payload: any, room?: string) {
  if (global.io) {
    if (room) {
      global.io.to(room).emit(event, payload);
    } else {
      global.io.emit(event, payload);
    }
  } else {
    console.warn('[Socket.io] Warning: Global IO instance not found for event:', event);
  }
}
