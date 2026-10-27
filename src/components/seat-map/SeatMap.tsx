'use client';

import React, { useState, useMemo } from 'react';
import { Seat, SeatStatus, SeatMapConfig, MOCK_SEAT_CONFIG } from '@/types/seats';

interface SeatMapProps {
  config?: SeatMapConfig;
  maxSelection?: number;
  occupiedSeats?: string[]; // IDs de asientos ya vendidos o bloqueados en BD
  onSelectionChange?: (selectedSeats: Seat[]) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  config = MOCK_SEAT_CONFIG,
  maxSelection = 6,
  occupiedSeats = ['C-4', 'C-5'], // Simulación de asientos ya ocupados en la BD
  onSelectionChange,
}) => {

  // Generación inicial de la grilla de asientos
  const initialSeats = useMemo(() => {
    const seatsList: Seat[] = [];
    const { rows, cols, blockedSeats, vipRows } = config;

    rows.forEach((row) => {
      for (let col = 1; col <= cols; col++) {
        const id = `${row}-${col}`;
        const isBlocked = blockedSeats.includes(id);
        const isOccupied = occupiedSeats.includes(id);
        const isVip = vipRows.includes(row);

        if (!isBlocked) {
          seatsList.push({
            id,
            row,
            number: col,
            price: isVip ? 15.00 : 10.00,
            isVip,
            status: isOccupied ? 'occupied' : 'available',
          });
        }
      }
    });

    return seatsList;
  }, [config, occupiedSeats]);

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  // Manejo de la selección / deselección
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'reserved') return;

    let updatedSelection: string[];

    if (selectedSeatIds.includes(seat.id)) {
      // Deseleccionar
      updatedSelection = selectedSeatIds.filter((id) => id !== seat.id);
    } else {
      // Validar límite máximo de selección
      if (selectedSeatIds.length >= maxSelection) {
        alert(`Solo puedes seleccionar un máximo de ${maxSelection} asientos.`);
        return;
      }
      // Seleccionar
      updatedSelection = [...selectedSeatIds, seat.id];
    }

    setSelectedSeatIds(updatedSelection);

    // Notificar al componente padre
    if (onSelectionChange) {
      const selectedObjects = initialSeats.filter((s) =>
        updatedSelection.includes(s.id)
      );
      onSelectionChange(selectedObjects);
    }
  };

  // Cálculo del total
  const selectedSeatsObjects = initialSeats.filter((s) =>
    selectedSeatIds.includes(s.id)
  );
  const totalPrice = selectedSeatsObjects.reduce((acc, curr) => acc + curr.price, 0);

  // Mapeo de estilos según estado
  const getSeatStyle = (seat: Seat, isSelected: boolean) => {
    if (seat.status === 'occupied') {
      return 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-600';
    }
    if (isSelected) {
      return 'bg-emerald-500 text-white font-bold border-emerald-400 scale-105 shadow-md shadow-emerald-500/30';
    }
    if (seat.isVip) {
      return 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-500 hover:text-black';
    }
    return 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-400';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-950 text-slate-100 rounded-xl shadow-2xl border border-slate-800">
      
      {/* 1. Representación visual de la Pantall*/}
      <div className="mb-10 text-center">
        <div className="w-3/4 mx-auto h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_10px_25px_rgba(99,102,241,0.5)] mb-2" />
        <span className="text-xs tracking-widest text-slate-400 uppercase font-semibold">
          Pantalla / Escenario
        </span>
      </div>

      {/* 2. Leyenda de Estados */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-600" />
          <span>Disponible ($10.00)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/40 border border-amber-500/50" />
          <span>VIP ($15.00)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-400" />
          <span>Tu Selección</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-700 border border-slate-600" />
          <span>Ocupado</span>
        </div>
      </div>

      {/* 3. Renderizado de Filas y Asientos */}
      <div className="flex flex-col items-center gap-3 overflow-x-auto py-4">
        {config.rows.map((row) => (
          <div key={row} className="flex items-center gap-3 min-w-max">
            {/* Letra de la Fila (Izquierda) */}
            <span className="w-6 text-center font-mono font-bold text-slate-400 text-sm">
              {row}
            </span>

            {/* Asientos de la Fila */}
            <div className="flex gap-2">
              {Array.from({ length: config.cols }).map((_, colIndex) => {
                const colNum = colIndex + 1;
                const seatId = `${row}-${colNum}`;
                const seat = initialSeats.find((s) => s.id === seatId);

                // Si el asiento está bloqueado/inhabilitado
                if (!seat) {
                  return <div key={seatId} className="w-9 h-9" />; // Espacio vacío / pasillo
                }

                const isSelected = selectedSeatIds.includes(seat.id);

                return (
                  <button
                    key={seat.id}
                    disabled={seat.status === 'occupied'}
                    onClick={() => handleSeatClick(seat)}
                    aria-label={`Asiento ${seat.id} - ${seat.status} - Precio $${seat.price}`}
                    className={`w-9 h-9 text-xs rounded-t-lg border transition-all duration-150 flex items-center justify-center font-mono ${getSeatStyle(
                      seat,
                      isSelected
                    )}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>

            {/* Letra de la Fila (Derecha) */}
            <span className="w-6 text-center font-mono font-bold text-slate-400 text-sm">
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Resumen de la Selección */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm text-slate-400">Asientos seleccionados ({selectedSeatIds.length}/{maxSelection}):</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedSeatIds.length > 0 ? (
              selectedSeatIds.map((id) => (
                <span
                  key={id}
                  className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded text-xs font-mono font-bold"
                >
                  {id}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Ningún asiento seleccionado</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total a pagar:</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            disabled={selectedSeatIds.length === 0}
            onClick={() => alert(`Iniciando reserva de: ${selectedSeatIds.join(', ')}`)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
          >
            Continuar Reserva
          </button>
        </div>
      </div>
    </div>
  );
};