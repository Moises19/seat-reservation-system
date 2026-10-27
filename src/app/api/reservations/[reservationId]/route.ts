// src/app/api/reservations/[reservationId]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types/api';
import QRCode from 'qrcode';

// 🔴 Forzar a Next.js a tratar esta ruta como dinámica (no estática en el Build)
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const { reservationId } = params;

    if (!reservationId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', details: 'ID de reserva requerido' } },
        { status: 400 }
      );
    }

    // Consulta SQL para obtener la información confirmada
    const sql = `
      SELECT 
        r.id as reservation_id,
        r.customer_name,
        r.customer_email,
        r.total_amount,
        r.payment_status,
        r.created_at,
        s.event_title,
        s.screen_name,
        s.show_time,
        array_agg(ss.seat_code) as seats
      FROM reservations r
      JOIN shows s ON r.show_id = s.id
      JOIN seat_holds sh ON r.hold_id = sh.id
      JOIN seat_hold_items shi ON sh.id = shi.hold_id
      JOIN show_seats ss ON shi.show_seat_id = ss.id
      WHERE r.id = $1 OR r.payment_intent_id = $1
      GROUP BY r.id, s.id;
    `;

    const rows = await query(sql, [reservationId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', details: 'Reserva no encontrada' } },
        { status: 404 }
      );
    }

    const reservation = rows[0];

    // Payload de verificación que leerá el validador en la entrada del evento
    const qrPayload = JSON.stringify({
      ticketId: reservation.reservation_id,
      seats: reservation.seats,
      event: reservation.event_title,
    });

    // 🎨 Generación de la imagen Base64 del código QR en el servidor
    const qrImageBase64 = await QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',  // Slate-900 para alto contraste
        light: '#ffffff',
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        reservationId: reservation.reservation_id,
        customerName: reservation.customer_name,
        customerEmail: reservation.customer_email,
        eventTitle: reservation.event_title,
        screenName: reservation.screen_name,
        showTime: reservation.show_time,
        seats: reservation.seats,
        totalAmount: parseFloat(reservation.total_amount),
        paymentStatus: reservation.payment_status,
        createdAt: reservation.created_at,
        qrImage: qrImageBase64, // 👈 Se envía la imagen Data URI completa
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Error generando ticket con QR:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', details: 'Error interno al consultar el ticket' } },
      { status: 500 }
    );
  }
}