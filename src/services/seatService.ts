import { query } from '@/lib/db';
import { Seat, SeatStatus } from '@/types/seats';

interface RawSeatRow {
  id: string;
  seat_code: string;
  row_label: string;
  seat_number: number;
  price: string;
  is_vip: boolean;
  is_blocked: boolean;
  hold_status: string | null;
  reservation_status: string | null;
}

export async function getSeatsByShow(showId: string): Promise<Seat[]> {
  // Consulta SQL que une asientos, bloqueos activos y reservas pagadas
  const sql = `
    SELECT 
      s.id,
      s.seat_code,
      s.row_label,
      s.seat_number,
      s.price,
      s.is_vip,
      s.is_blocked,
      sh.status as hold_status,
      r.payment_status as reservation_status
    FROM show_seats s
    LEFT JOIN seat_hold_items shi ON s.id = shi.show_seat_id
    LEFT JOIN seat_holds sh ON shi.hold_id = sh.id 
      AND sh.status = 'active' 
      AND sh.expires_at > NOW()
    LEFT JOIN reservations r ON sh.id = r.hold_id 
      AND r.payment_status = 'paid'
    WHERE s.show_id = $1
    ORDER BY s.row_label ASC, s.seat_number ASC;
  `;

  const rows = await query<RawSeatRow>(sql, [showId]);

  return rows.map((row) => {
    let status: SeatStatus = 'available';

    if (row.is_blocked) {
      status = 'occupied';
    } else if (row.reservation_status === 'paid') {
      status = 'occupied';
    } else if (row.hold_status === 'active') {
      status = 'reserved';
    }

    return {
      id: row.seat_code,
      row: row.row_label,
      number: row.seat_number,
      price: parseFloat(row.price),
      isVip: row.is_vip,
      status,
    };
  });
}