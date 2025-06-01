import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { io, Socket } from 'socket.io-client';

function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock activado');
        }
      } catch (err) {
        console.error('Error al solicitar Wake Lock:', err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLockRef.current?.release();
    };
  }, []);
}

const App: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);

  const fetchToken = async (): Promise<string> => {
    const res = await fetch('http://192.168.0.128:3001/api/token');
    const data = await res.json();
    return data.token;
  }

  useEffect(() => {
    let socket: Socket;

    const startSocket = async () => {
      const token = await fetchToken();

      socket = io('http://192.168.0.128:3001', {
        auth: {
          token
        }
      });

      socket.on('connect', () => {
        console.log('🟢 Socket conectado');
      });

      socket.on('userCount', (count) => {
        console.log('🔁 Usuarios online:', count);
        setUserCount(count);
      });

      socket.on('disconnect', () => {
        console.log('🔴 Socket desconectado');
      });
    };

    startSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useWakeLock();

  return (
    <div className='container-screen'>
      <h1>Pantalla activa <span className='sun-icon'>🔆</span></h1>
      <span>Mentes creativas en pausa 🎈 : {userCount}</span>
    </div>
  );
};

export default App;
