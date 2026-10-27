export type SeatStatus = 'available' | 'selected' | 'reserved' | 'occupied';

export interface Seat {
  id: string;        // ej: "A-1"
  row: string;       // ej: "A"
  number: number;    // ej: 1
  price: number;     // ej: 12.50
  status: SeatStatus;
  isVip?: boolean;
}

export interface SeatMapConfig {
  rows: string[];
  cols: number;
  blockedSeats: string[]; // Asientos fuera de servicio o pasillos (ej: ['A-1', 'A-8'])
  vipRows: string[];     // Filas con tarifa VIP
}

// Configuración Mock/Prueba (5 filas x 8 columnas)
export const MOCK_SEAT_CONFIG: SeatMapConfig = {
  rows: ['A', 'B', 'C', 'D', 'E'],
  cols: 8,
  blockedSeats: ['A-1', 'A-8', 'B-1', 'B-8'], // Simula esquinas inhabilitadas o entradas
  vipRows: ['E'],
};