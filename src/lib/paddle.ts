import { Environment, Paddle } from '@paddle/paddle-node-sdk';

const apiKey = process.env.PADDLE_API_KEY || '';

// We use sandbox environment by default unless we are explicitly in production
export const paddle = new Paddle(apiKey, {
    environment: process.env.NODE_ENV === 'production' && !apiKey.startsWith('LOCAL_TEST') ? Environment.production : Environment.sandbox
});
