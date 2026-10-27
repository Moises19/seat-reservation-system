'use client';

import React, { useState, useEffect } from 'react';
import { ReservationTimer } from '@/components/checkout/ReservationTimer';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [seats, setSeats] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<string>('');
  
  // Datos del formulario de pago
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const saved = sessionStorage.getItem('pendingSeats');
    if (!saved) {
      router.push('/');
      return;
    }

    setSeats(JSON.parse(saved));

    // Simulamos una expiración de 10 minutos a partir de ahora para las pruebas
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    setExpiresAt(tenMinutesLater);
  }, [router]);

  const handleExpire = () => {
    alert('Tu tiempo de reserva ha expirado. Por favor, selecciona tus asientos nuevamente.');
    sessionStorage.removeItem('pendingSeats');
    router.push('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Procesando pago para ${customer.name} (${customer.email}) por los asientos: ${seats.join(', ')}`);
  };

  if (!expiresAt) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        
        {/* Encabezado del Checkout */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold">Resumen de Compra</h1>
            <p className="text-xs text-slate-400">Completa tus datos para confirmar</p>
          </div>
          <ReservationTimer expiresAt={expiresAt} onExpire={handleExpire} />
        </div>

        {/* Resumen de Asientos */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <span className="text-xs text-slate-400">Asientos Reservados:</span>
          <div className="flex flex-wrap gap-2">
            {seats.map((seatId) => (
              <span
                key={seatId}
                className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold rounded"
              >
                {seatId}
              </span>
            ))}
          </div>
        </div>

        {/* Formulario de Datos */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Juan Pérez"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="juan@ejemplo.com"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 mt-4"
          >
            Pagar Ahora
          </button>
        </form>
      </div>
    </main>
  );
}