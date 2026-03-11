import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { resume_text, job_description } = body;

        if (!resume_text || !job_description) {
            return NextResponse.json({ error: 'resume_text and job_description are required' }, { status: 400 });
        }

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) parser and technical recruiter. 
Compare the provided Resume with the provided Job Description.

Analyze the text and return ONLY a JSON object with the following structure:
{
  "match_score": <number between 0 and 100 representing the match percentage>,
  "missing_keywords": ["keyword1", "keyword2", ...],
  "matching_skills": ["skill1", "skill2", ...]
}

- Be strict on the match_score. 100 means exact match, 0 means completely irrelevant.
- Provide up to 8 of the most critical missing keywords/skills not found in the resume.
- Provide up to 8 of the best matching skills found in both.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `RESUME:\n${resume_text}\n\nJOB DESCRIPTION:\n${job_description}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2, // low temperature for more deterministic ATS scoring
        });

        const content = response.choices[0].message.content;

        if (!content) throw new Error("No content generated");

        const result = JSON.parse(content);
        return NextResponse.json(result);

    } catch (e: any) {
        console.error('Match Score Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
