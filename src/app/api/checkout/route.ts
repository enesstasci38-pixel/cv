import { NextResponse } from 'next/server';
import { paddle } from '@/lib/paddle';

export async function POST(req: Request) {
    try {
        const provider = process.env.NEXT_PUBLIC_BILLING_PROVIDER || 'paddle';

        if (provider === 'manual') {
            // Simulate successful checkout session creation for manual testing
            return NextResponse.json({
                url: '/dashboard?manual_checkout_success=true',
                provider: 'manual'
            });
        }

        // Usually with Paddle js (inline checkout), we just pass the Price ID to the frontend 
        // and it opens the overlay. However, if we needed to generate a transaction dynamically:

        // const body = await req.json();
        // const { priceId } = body;
        // const transaction = await paddle.transactions.create({
        //   items: [{ priceId, quantity: 1 }],
        // });
        // return NextResponse.json({ transactionId: transaction.id });

        return NextResponse.json({ message: 'Paddle uses client-side checkout overlay. No server transaction generation needed for basic flow.' });

    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
