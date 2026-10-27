'use client';

import React, { useState, useEffect } from 'react';

interface ReservationTimerProps {
  expiresAt: string; // ISO Timestamp (ej: "2026-10-26T15:30:00.000Z")
  onExpire?: () => void;
}

export const ReservationTimer: React.FC<ReservationTimerProps> = ({
  expiresAt,
  onExpire,
}) => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      const remaining = Math.max(0, Math.floor(difference / 1000));
      
      setTimeLeftSeconds(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  const isLowTime = timeLeftSeconds <= 120; // Alerta cuando quedan 2 minutos o menos

  return (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg border font-mono transition-colors ${
        isLowTime
          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
          : 'bg-slate-900 border-slate-700 text-amber-400'
      }`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <div className="text-xs">
        <span className="text-slate-400 block font-sans text-[10px] uppercase tracking-wider">
          Tiempo para pagar
        </span>
        <span className="text-base font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};