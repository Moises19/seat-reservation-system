import { Seat } from './seats';

export type HoldStatus = 'active' | 'expired' | 'completed' | 'cancelled';

export interface SeatHold {
  id: string;               // UUID del bloqueo temporal
  showId: string;           // ID de la función/película
  seatIds: string[];        // Asientos bloqueados (ej: ["A-2", "A-3"])
  userId?: string;          // ID del usuario registrado (opcional)
  sessionId: string;        // ID único de sesión del navegador/cliente
  status: HoldStatus;       
  expiresAt: string;        // ISO Timestamp de expiración (10 min en el futuro)
  createdAt: string;        // ISO Timestamp de creación
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface ReservationTransaction {
  id: string;               // ID de la reserva confirmada/pagada
  holdId: string;           // Referencia al Hold original
  showId: string;
  seats: Seat[];
  customer: CustomerInfo;
  totalAmount: number;
  paymentIntentId: string;  // ID de la transacción en la pasarela (ej: Stripe)
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}