import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { resume_text, job_description } = body;

        if (!resume_text) {
            return NextResponse.json({ error: 'resume_text is required' }, { status: 400 });
        }

        const context = job_description ? `Here is the target job description:\n${job_description}\n\n` : '';

        const systemPrompt = `You are an expert Technical Interviewer. ${job_description ? 'Based on the Target Job Description and the' : 'Based on the provided'} Candidate's Resume, generate 5 highly relevant interview questions they are likely to be asked.

For each question, provide a robust, suggested answer using the STAR method (Situation, Task, Action, Result) that explicitly draws upon facts and experiences from their Resume.

Return ONLY a JSON object with the following structure:
{
  "questions": [
    {
      "question": "The interview question text",
      "suggested_answer_star": "Suggested answer focusing on their resume details using STAR method."
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${context}CANDIDATE RESUME:\n${resume_text}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        const result = JSON.parse(content);
        return NextResponse.json(result);

    } catch (e: any) {
        console.error('Interview Prep Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
