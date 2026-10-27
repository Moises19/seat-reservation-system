'use client';

import React, { useState } from 'react';
import { SeatMap } from '@/components/seat-map/SeatMap';
import { Seat } from '@/types/seats';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const handleSelectionChange = (seats: Seat[]) => {
    setSelectedSeats(seats);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;

    // Guardado temporal local para simular la transición a checkout
    const seatIds = selectedSeats.map((s) => s.id);
    sessionStorage.setItem('pendingSeats', JSON.stringify(seatIds));

    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Sistema de Reserva de Asientos
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Selecciona tus asientos para la función de prueba.
          </p>
        </header>

        {/* Mapa Interactivo */}
        <SeatMap onSelectionChange={handleSelectionChange} />

        {/* Barra Flotante para Confirmación en Móviles/Escritorio */}
        {selectedSeats.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50">
            <div>
              <span className="text-xs text-slate-400 block">Asientos:</span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {selectedSeats.map((s) => s.id).join(', ')}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30"
            >
              Ir a Pagar (${selectedSeats.reduce((a, b) => a + b.price, 0).toFixed(2)})
            </button>
          </div>
        )}
      </div>
    </main>
  );
}