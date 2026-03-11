import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Authenticate user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // 2. Parse request body
        const { prompt } = await req.json();

        if (!prompt) {
            return new Response('Prompt is required', { status: 400 });
        }

        // 3. System prompt for the AI
        const systemPrompt = `You are an expert career coach and professional copywriter specializing in cover letters. 
Your goal is to write a highly compelling, personalized, and ATS-friendly cover letter based on the provided resume context and the job description.
Do not invent experiences that are not in the resume context, but frame the existing experiences in the most impactful way possible for the target job.
Follow standard cover letter formatting:
- Contact Information
- Salutation
- Introduction (Hook)
- Body Paragraphs (Aligning skills with job requirements)
- Call to Action (Conclusion)
- Sign-off

Make it sound human, tailored, and confident depending on the tone requested.`;

        // 4. Generate streaming response
        const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: systemPrompt,
            prompt: prompt,
            temperature: 0.7,
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error('Generate Cover Letter Error:', error);
        return new Response(error.message || 'Internal Server Error', { status: 500 });
    }
}
