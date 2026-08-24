import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { customerPhone, customerName, items } = body;

        if (!customerPhone || !items || !Array.isArray(items) || items.length === 0) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Calculate total and create summary
        let totalAmount = 0;
        const productNames: string[] = [];

        for (const item of items) {
            if (!item.name || !item.price) {
                return new NextResponse('Invalid item data', { status: 400 });
            }
            totalAmount += parseFloat(item.price);
            productNames.push(item.name);
        }

        const productDetails = productNames.join(', ');
        const readableId = `#${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const order = await prisma.order.create({
            data: {
                readableId,
                customerPhone,
                customerName,
                productDetails, // Store summary for backward compatibility/table display
                amount: totalAmount,
                status: 'PENDING_PAYMENT',
                items: {
                    create: items.map((item: any) => ({
                        name: item.name,
                        price: parseFloat(item.price)
                    }))
                }
            },
        });

        // Create Stripe Checkout Session
        const stripeSession = await stripe.checkout.sessions.create({
            automatic_payment_methods: { enabled: true },
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(parseFloat(item.price) * 100), // Stripe expects cents
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL}/order/success?orderId=${order.id}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/order/failed?orderId=${order.id}`, // Consider creating a failed page too
            metadata: {
                orderId: order.id,
            },
        } as any);

        // Update order with payment link
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
                stripePaymentLink: stripeSession.url,
                stripeSessionId: stripeSession.id,
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        console.error('[ORDER_POST]', error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('[ORDER_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
