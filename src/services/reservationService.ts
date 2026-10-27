import { pool } from '@/lib/db';
import { CreateHoldResponse } from '@/types/api';

const HOLD_DURATION_MINUTES = 10;

export async function createSeatHold(
  showId: string,
  seatCodes: string[],
  sessionId: string
): Promise<CreateHoldResponse> {
  const client = await pool.connect();

  try {
    // Iniciar transacción explícita ACID
    await client.query('BEGIN');

    // 1. Obtener los IDs de los asientos solicitados con bloqueo de fila (FOR UPDATE)
    const seatsQuery = `
      SELECT id, seat_code 
      FROM show_seats 
      WHERE show_id = $1 AND seat_code = ANY($2) AND is_blocked = FALSE
      FOR UPDATE;
    `;
    const seatsResult = await client.query(seatsQuery, [showId, seatCodes]);

    if (seatsResult.rows.length !== seatCodes.length) {
      throw new Error('SEATS_NOT_FOUND_OR_BLOCKED');
    }

    const showSeatIds = seatsResult.rows.map((r) => r.id);

    // 2. Verificar que NINGUNO de los asientos tenga un bloqueo activo o esté pagado
    const conflictQuery = `
      SELECT shi.show_seat_id 
      FROM seat_hold_items shi
      JOIN seat_holds sh ON shi.hold_id = sh.id
      LEFT JOIN reservations r ON sh.id = r.hold_id
      WHERE shi.show_seat_id = ANY($1) 
        AND (
          (sh.status = 'active' AND sh.expires_at > NOW()) 
          OR r.payment_status = 'paid'
        );
    `;
    const conflictResult = await client.query(conflictQuery, [showSeatIds]);

    if (conflictResult.rows.length > 0) {
      throw new Error('SEATS_ALREADY_RESERVED');
    }

    // 3. Crear el registro del Hold con tiempo de expiración
    const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);
    
    const insertHoldQuery = `
      INSERT INTO seat_holds (show_id, session_id, expires_at, status)
      VALUES ($1, $2, $3, 'active')
      RETURNING id, expires_at;
    `;
    const holdResult = await client.query(insertHoldQuery, [
      showId,
      sessionId,
      expiresAt.toISOString(),
    ]);

    const holdId = holdResult.rows[0].id;

    // 4. Asociar los asientos con el Hold en la tabla pivote
    const insertItemsQuery = `
      INSERT INTO seat_hold_items (hold_id, show_seat_id)
      SELECT $1, unnest($2::uuid[]);
    `;
    await client.query(insertItemsQuery, [holdId, showSeatIds]);

    // Confirmar transacción
    await client.query('COMMIT');

    return {
      holdId,
      expiresAt: expiresAt.toISOString(),
      timeRemainingSeconds: HOLD_DURATION_MINUTES * 60,
      seats: seatCodes,
    };
  } catch (error) {
    // En caso de conflicto o falla, revertir cambios
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}