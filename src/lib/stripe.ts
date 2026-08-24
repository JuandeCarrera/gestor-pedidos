import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-ignore - Stripe types might be slightly out of sync with recent acacia versions in some environments
    apiVersion: '2025-01-27.acacia',
    typescript: true,
});
