// src/services/paymentService.ts
import { pool } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { CustomerInfo } from '@/types/reservation';

interface CreateCheckoutSessionParams {
  holdId: string;
  showId: string;
  customer: CustomerInfo;
  seatCodes: string[];
  totalAmount: number;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  holdId,
  showId,
  customer,
  seatCodes,
  totalAmount,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  const unitAmountCents = Math.round(totalAmount * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customer.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Reserva de Asientos: ${seatCodes.join(', ')}`,
            description: `Reserva para la función ID: ${showId}`,
          },
          unit_amount: unitAmountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      holdId,
      showId,
      customerName: customer.name,
      customerEmail: customer.email,
      seatCodes: seatCodes.join(','),
    },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
  };
}

/**
 * Confirmación de reserva con IDEMPOTENCIA nativa.
 */
export async function confirmReservationPayment(
  holdId: string,
  showId: string,
  customerName: string,
  customerEmail: string,
  paymentIntentId: string,
  totalAmount: number
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. CHEQUEO DE IDEMPOTENCIA:
    // Verificar si esta transacción de Stripe (paymentIntentId) ya fue procesada anteriormente
    const existingPayment = await client.query(
      `SELECT id, created_at FROM reservations WHERE payment_intent_id = $1 FOR UPDATE;`,
      [paymentIntentId]
    );

    if (existingPayment.rows.length > 0) {
      // El evento ya se procesó en un reintento anterior. 
      // Hacemos COMMIT y retornamos status 'duplicate' sin alterar datos.
      await client.query('COMMIT');
      console.log(`ℹ️ [IDEMPOTENCIA] El pago ${paymentIntentId} ya había sido procesado. Se omite duplicado.`);
      return {
        success: true,
        isDuplicate: true,
        reservationId: existingPayment.rows[0].id,
      };
    }

    // 2. Verificar el estado del Hold
    const holdCheck = await client.query(
      `SELECT id, status FROM seat_holds WHERE id = $1 FOR UPDATE;`,
      [holdId]
    );

    if (holdCheck.rows.length === 0) {
      throw new Error(`HOLD_NOT_FOUND: ${holdId}`);
    }

    // Si el hold ya fue marcado como 'completed' por otro proceso paralelo
    if (holdCheck.rows[0].status === 'completed') {
      await client.query('COMMIT');
      console.log(`ℹ️ [IDEMPOTENCIA] El Hold ${holdId} ya figuraba como completado.`);
      return { success: true, isDuplicate: true };
    }

    // 3. Registrar la reserva con ON CONFLICT por si ocurre una condición de carrera extrema
    const insertReservationSql = `
      INSERT INTO reservations (
        hold_id, 
        show_id, 
        customer_name, 
        customer_email, 
        total_amount, 
        payment_intent_id, 
        payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'paid')
      ON CONFLICT (payment_intent_id) DO NOTHING
      RETURNING id;
    `;

    const resResult = await client.query(insertReservationSql, [
      holdId,
      showId,
      customerName,
      customerEmail,
      totalAmount,
      paymentIntentId,
    ]);

    // 4. Actualizar el estado del Hold a completado
    await client.query(
      `UPDATE seat_holds SET status = 'completed' WHERE id = $1;`,
      [holdId]
    );

    await client.query('COMMIT');

    return {
      success: true,
      isDuplicate: false,
      reservationId: resResult.rows[0]?.id,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al confirmar reserva pagada:', error);
    throw error;
  } finally {
    client.release();
  }
}