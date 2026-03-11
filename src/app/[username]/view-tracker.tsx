'use client';

import { useEffect, useRef } from 'react';

export default function ViewTracker({ username }: { username: string }) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (hasTracked.current) return;

        hasTracked.current = true;

        // Track the view in the background
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        }).catch(err => console.error("Failed to track view", err));

    }, [username]);

    return null; // Invisible component
}
