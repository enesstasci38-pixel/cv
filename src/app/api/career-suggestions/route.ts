import { NextResponse } from 'next/server';
import OpenAI from 'openai';


export async function POST(req: Request) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const body = await req.json();
        const { resume_text } = body;

        if (!resume_text) {
            return NextResponse.json({ error: 'resume_text is required' }, { status: 400 });
        }

        const systemPrompt = `You are an expert Career Coach.
Analyze the provided Resume and suggest 3-5 alternative or advanced job titles the candidate qualifies for or could logically pivot to.

Return ONLY a JSON object with the following structure:
{
  "suggestions": [
    {
      "job_title": "Alternative Job Title",
      "reasoning": "Why they qualify based on their resume",
      "skill_gaps": ["Skill 1 to learn", "Skill 2 to learn"]
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `RESUME:\n${resume_text}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        const result = JSON.parse(content);
        return NextResponse.json(result);

    } catch (e: any) {
        console.error('Career Suggestions Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
