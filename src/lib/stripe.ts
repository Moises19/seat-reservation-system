// src/lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('⚠️ Falta la variable STRIPE_SECRET_KEY en el entorno.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Versión compatible con Next.js 14
  typescript: true,
});