'use client';

import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { createContext, useContext, useEffect, useState } from 'react';

type PaddleContextType = {
    paddle: Paddle | null;
};

const PaddleContext = createContext<PaddleContextType>({ paddle: null });

export function PaddleProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [paddle, setPaddle] = useState<Paddle | null>(null);

    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!token) return;

        initializePaddle({
            environment: process.env.NODE_ENV === 'production' && !token.startsWith('test_') ? 'production' : 'sandbox',
            token,
        }).then((paddleInstance) => {
            if (paddleInstance) {
                setPaddle(paddleInstance);
            }
        });
    }, []);

    return (
        <PaddleContext.Provider value={{ paddle }}>
            {children}
        </PaddleContext.Provider>
    );
}

export function usePaddle() {
    return useContext(PaddleContext);
}
