'use client';

import { useState } from 'react';
import { usePaddle } from './paddle-provider';
import { Button } from './ui/button'; // Assuming shadcn UI Button is available
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
    priceId?: string;
    className?: string;
    children?: React.ReactNode;
}

export function CheckoutButton({
    priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
    className,
    children,
}: CheckoutButtonProps) {
    const { paddle } = usePaddle();
    const [loading, setLoading] = useState(false);

    const handleCheckout = () => {
        if (!paddle || !priceId) {
            console.error('Paddle not initialized or Price ID missing');
            return;
        }

        setLoading(true);

        try {
            paddle.Checkout.open({
                items: [
                    {
                        priceId: priceId,
                        quantity: 1,
                    },
                ],
                // You can pass customer email or ID here to link the transaction
                // customer: { email: user?.email },
                // customData: { userId: user?.id }
            });
        } catch (error) {
            console.error('Error opening checkout:', error);
        } finally {
            // Paddle overlay takes over, we can stop loading for now
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckout}
            className={className}
            disabled={!paddle || loading || !priceId}
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {children || 'Upgrade Now'}
        </Button>
    );
}
