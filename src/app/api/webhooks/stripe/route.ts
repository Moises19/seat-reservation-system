// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { confirmReservationPayment } from '@/services/paymentService';
import Stripe from 'stripe';

// 🔴 Forzar a Next.js a tratar esta ruta como dinámica (no estática en el Build)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`❌ Error de verificación de Webhook: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Manejo del evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await confirmReservationPayment(session);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}