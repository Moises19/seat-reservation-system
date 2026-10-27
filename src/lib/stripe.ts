// src/lib/stripe.ts
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY no está configurada en el entorno.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});