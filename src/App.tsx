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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue.toString());
  };
  const fetchToken = async () => {
    try{
      const res = await fetch('https://activescreenapi.bitsar.com.ar/api/token');
      const data = await res.json();
      return data.token;

    }catch(err){
      console.error('Error al solicitar users:', err);
    }
  }

  useEffect(() => {
    let socket: Socket;

    const startSocket = async () => {
      const token = await fetchToken();

      socket = io('https://activescreenapi.bitsar.com.ar', {
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
    <div className={`container-screen ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="toggle-button" onClick={toggleDarkMode}>
        {darkMode ? '☀️ Modo claro' : '🌙 Modo oscuro'}
      </button>
      <h1>Pantalla activa <span className='sun-icon'>🔆</span></h1>
      <span>{(userCount > 0 ? userCount: '')} 😎 Mentes creativas en pausa 🎈 </span>
    </div>
  );
};

export default App;
