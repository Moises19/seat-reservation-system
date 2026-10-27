'use client';

import React from 'react';

interface TicketData {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  eventTitle: string;
  screenName: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  qrImage: string; // Data URL Base64
}

interface DigitalTicketProps {
  ticket: TicketData;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({ ticket }) => {
  const formattedDate = new Date(ticket.showTime).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100">
      
      {/* Cabecera del Boleto */}
      <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 p-6 text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-100 block mb-1">
          Boleto de Entrada Confirmado
        </span>
        <h2 className="text-xl font-black text-white leading-tight">
          {ticket.eventTitle}
        </h2>
        <p className="text-xs text-emerald-100 mt-1 font-medium">
          {ticket.screenName}
        </p>
      </div>

      {/* Detalles de la Reserva */}
      <div className="p-6 space-y-6">
        
        <div className="border-b border-slate-800 pb-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Fecha y Hora
          </span>
          <p className="text-sm font-bold text-slate-200 capitalize mt-0.5">
            {formattedDate}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Asientos
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ticket.seats.map((seat) => (
                <span
                  key={seat}
                  className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold rounded"
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Titular
            </span>
            <p className="text-xs font-bold text-slate-200 truncate mt-1">
              {ticket.customerName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {ticket.customerEmail}
            </p>
          </div>
        </div>

        {/* Renderizado de la Imagen QR desde Base64 */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="p-2 bg-white rounded-xl shadow-lg inline-block">
            <img
              src={ticket.qrImage}
              alt="Código QR del Ticket"
              className="w-44 h-44 object-contain rounded"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center">
            ID: {ticket.reservationId.slice(0, 8)}...
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
          <span>Estado del Pago: <strong className="text-emerald-400 font-semibold">PAGADO</strong></span>
          <span className="text-sm font-bold text-slate-200 font-mono">
            Total: ${ticket.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};