export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;           // ej: "SEAT_ALREADY_LOCKED", "PAYMENT_FAILED"
    details?: string;
  };
}

// Request Payload para intentar un bloqueo (POST /api/shows/[showId]/hold)
export interface CreateHoldRequest {
  seatIds: string[];
  sessionId: string;
}

// Response Payload para un bloqueo exitoso
export interface CreateHoldResponse {
  holdId: string;
  expiresAt: string;
  timeRemainingSeconds: number;
  seats: string[];
}