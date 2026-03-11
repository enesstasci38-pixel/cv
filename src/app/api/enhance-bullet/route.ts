import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const result = streamText({
            model: openai('gpt-4o-mini'),
            system: `You are an expert resume writer and career coach. 
Your task is to take a bullet point describing a work experience or achievement and improve it.
Make it sound more professional, compelling, and action-oriented.
Focus on quantifiable metrics and strong action verbs.
Return ONLY the enhanced bullet point text as a single string, without formatting like bold or quotes.`,
            prompt: `Please improve the following bullet point:
${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('AI Bullet Enhancement Error:', error);
        return new Response('Error enhancing bullet point', { status: 500 });
    }
}
