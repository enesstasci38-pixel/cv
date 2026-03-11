import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const result = streamText({
            model: openai('gpt-4o-mini'),
            system: `You are an expert resume writer and career coach. 
Your job is to take raw notes about a user's experience, education, skills, and achievements, and turn them into a professional, ATS-optimized resume. 
Format the output in clean Markdown. Group the information logically (e.g., Summary, Experience, Education, Skills, Achievements). 
Use strong action verbs and emphasize quantifiable results. Be concise but impactful.`,
            prompt: `Please generate a professional resume based on these details:
${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('AI Resume Generation Error:', error);
        return new Response('Error generating resume', { status: 500 });
    }
}
