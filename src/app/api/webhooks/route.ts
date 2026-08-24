import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    console.log('[WEBHOOK] Received request');

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET is missing');
            return new NextResponse('Webhook Error: Missing Secret', { status: 500 });
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log('[WEBHOOK] Signature verification successful');
    } catch (error: any) {
        console.error(`[WEBHOOK] Signature Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`[WEBHOOK] Event type: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
        const orderId = session.metadata?.orderId;
        console.log(`[WEBHOOK] Order ID found in metadata: ${orderId}`);

        if (orderId) {
            try {
                const updated = await prisma.order.update({
                    where: {
                        id: orderId,
                    },
                    data: {
                        status: 'PAID',
                        paidAt: new Date(),
                    },
                });
                console.log(`[WEBHOOK] Order ${orderId} marked as PAID. result:`, updated);
            } catch (dbError) {
                console.error('[WEBHOOK] Database update failed:', dbError);
            }
        } else {
            console.warn('[WEBHOOK] No orderId in metadata');
        }
    }

    return new NextResponse(null, { status: 200 });
}
