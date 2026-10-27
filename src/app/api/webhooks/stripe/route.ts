// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { confirmReservationPayment } from '@/services/paymentService';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Configuración de firma/secret inválida' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error de firma en Webhook: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const holdId = session.metadata?.holdId;
    const showId = session.metadata?.showId;
    const customerName = session.metadata?.customerName;
    const customerEmail = session.metadata?.customerEmail;
    const paymentIntentId = session.payment_intent as string;
    const totalAmount = (session.amount_total || 0) / 100;

    if (!holdId || !showId || !customerName || !customerEmail || !paymentIntentId) {
      console.error('❌ Metadata incompleta en evento Stripe');
      return NextResponse.json(
        { error: 'Metadata requerida no presente' },
        { status: 400 }
      );
    }

    try {
      // Llamada al servicio idempotente
      const result = await confirmReservationPayment(
        holdId,
        showId,
        customerName,
        customerEmail,
        paymentIntentId,
        totalAmount
      );

      if (result.isDuplicate) {
        // Le confirmamos a Stripe 200 OK para que deje de reintentar el evento
        return NextResponse.json(
          { received: true, message: 'Evento duplicado ya procesado previo' },
          { status: 200 }
        );
      }

      console.log(`✅ [PROCESADO] Reserva ${result.reservationId} confirmada con éxito.`);
    } catch (error) {
      console.error(`❌ Error procesando confirmación de reserva:`, error);
      // Retornar 500 para que Stripe reintente en caso de un fallo de BBDD temporal
      return NextResponse.json(
        { error: 'Error interno de servidor al procesar la reserva' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}