import { Redis } from '@upstash/redis';

// Si no existen las variables, proveemos un mock seguro para entornos de prueba
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://mock-redis.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock-token',
});

// Helper de llaves para mantener orden
export const REDIS_KEYS = {
  seatHold: (showId: string, seatCode: string) => `hold:${showId}:${seatCode}`,
  sessionHolds: (sessionId: string) => `session:${sessionId}:holds`,
};