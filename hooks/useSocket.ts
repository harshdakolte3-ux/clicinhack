'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(window.location.origin, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
      });
    }

    setSocket(socketInstance);

    function onConnect() {
      setIsConnected(true);
      console.log('[useSocket] Connected to WebSocket server');
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('[useSocket] Disconnected from WebSocket server');
    }

    if (socketInstance.connected) {
      setIsConnected(true);
    }

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    return () => {
      if (socketInstance) {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
      }
    };
  }, []);

  return { socket, isConnected };
}
