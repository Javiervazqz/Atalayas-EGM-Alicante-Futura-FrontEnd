'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: number; // ← lo centralizamos aquí
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: 0,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const socketRef = useRef<Socket | null>(null); // ref para evitar closures stale

  const connect = () => {
    // Si ya hay socket conectado, no hacer nada
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

    const newSocket = io(`${backendUrl}/stats`, {
      transports: ['websocket'],
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket conectado');
    });

    newSocket.on('userCount', (count: number) => {
      setOnlineUsers(count);
    });

    // Por si el backend emite con otro nombre
    newSocket.on('updateOnlineCount', (data: { count: number } | number) => {
      setOnlineUsers(typeof data === 'number' ? data : data.count);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setOnlineUsers(0);
  };

  useEffect(() => {
    // Intento inicial (usuario ya logueado / refresco de página)
    connect();

    // Escuchar evento de login (disparado manualmente tras login exitoso)
    const handleLogin = () => connect();
    const handleLogout = () => disconnect();

    window.addEventListener('user:login', handleLogin);
    window.addEventListener('user:logout', handleLogout);

    // Para pestañas distintas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) connect();
        else disconnect();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('user:login', handleLogin);
      window.removeEventListener('user:logout', handleLogout);
      window.removeEventListener('storage', handleStorage);
      disconnect();
    };
  }, []); // ← sin dependencias, se ejecuta solo una vez

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);