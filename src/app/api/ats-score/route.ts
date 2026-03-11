import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { resumeText, jobDescription } = await req.json();

        const result = await generateObject({
            model: openai('gpt-4o-mini'),
            system: `You are an expert ATS (Applicant Tracking System) software and HR recruiter analyzer. 
Analyze the given resume against ATS best practices. Optionally analyze it against a specific job description if provided. 
Provide an overall score out of 100.
Identify strong points in the resume (like good action verbs, quantifiable metrics, good formatting clues).
List detailed and actionable areas of improvement (like "add more metrics to the experience section", "weak verb found: 'helped'").`,
            prompt: `Please analyze the following resume details:
${resumeText}

${jobDescription ? `Against this job description:\n${jobDescription}` : 'Make a general ATS analysis.'}`,
            schema: z.object({
                score: z.number().min(0).max(100).describe('The overall ATS score out of 100.'),
                feedback: z.object({
                    strengths: z.array(z.string()).describe('List of strong aspects of this resume. At least 2 items.'),
                    improvements: z.array(z.string()).describe('List of actionable suggestions for improvement. At least 2 items.')
                })
            })
        });

        return Response.json(result.object);
    } catch (error) {
        console.error('ATS Score Error:', error);
        return new Response(JSON.stringify({ error: 'Error calculating ATS score' }), { status: 500 });
    }
}
