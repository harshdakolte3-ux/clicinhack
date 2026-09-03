const express = require('express');
const http = require('http');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
    path: '/socket.io/',
  });

  global.io = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Connected: ${socket.id}`);

    socket.on('join:ticket', (ticketId) => {
      socket.join(`ticket-${ticketId}`);
      console.log(`Socket ${socket.id} joined room: ticket-${ticketId}`);
    });

    socket.on('join:counter', (counterId) => {
      socket.join(`counter-${counterId}`);
      socket.join('counter-room');
    });

    socket.on('join:tv', () => {
      socket.join('tv-room');
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Disconnected: ${socket.id}`);
    });
  });

  // Next.js handles all non-socket routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> Socket.io Real-Time Engine attached on /socket.io/`);
  });
});
