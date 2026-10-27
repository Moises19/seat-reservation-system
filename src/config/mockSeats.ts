import { SeatMapConfig } from '@/types/seats';

export const MOCK_SEAT_CONFIG: SeatMapConfig = {
  rows: ['A', 'B', 'C', 'D', 'E'],
  cols: 8,
  blockedSeats: ['A-1', 'A-8', 'B-1', 'B-8'],
  vipRows: ['E'],
};