import React, { useEffect, useRef } from 'react';
import './App.css';

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
  useWakeLock();
  return (
    <div className='container-screen'>
      <h1>Pantalla activa <span className='sun-icon'>🔆</span></h1>
    </div>
  );
}

export default App;
