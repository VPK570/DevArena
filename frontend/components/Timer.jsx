"use client";

import { useEffect } from 'react';

export default function Timer({ seconds, setSeconds, isRunning }) {
  useEffect(() => {
    let intervalId;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, setSeconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="bg-surface-container-lowest px-4 py-1 border border-error-container/30">
        <span className="font-terminal text-2xl text-error timer-glow tracking-widest">{mm}:{ss}</span>
    </div>
  );
}
