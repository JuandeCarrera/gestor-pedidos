import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const params = await props.params;
        const body = await req.json();
        const { status } = body;
        const { id } = params;

        const dataToUpdate: any = { status };

        if (status === 'PAID') {
            dataToUpdate.paidAt = new Date();
        } else if (status === 'COLLECTED') {
            dataToUpdate.collectedAt = new Date();
        }

        const order = await prisma.order.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('[ORDER_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
