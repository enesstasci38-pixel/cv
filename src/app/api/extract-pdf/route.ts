import { NextResponse } from 'next/server';

if (typeof global.DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() { }
    };
}

// @ts-ignore
const pdfParse = require('pdf-parse');
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are supported currently.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdfParse(buffer);
        const rawText = data.text;

        // Use OpenAI to parse the raw text into structured JSON data
        const result = await generateObject({
            model: openai('gpt-4o-mini'),
            system: `You are an expert HR data extractor. Your job is to extract resume information from unstructured text and format it into a structured JSON schema.`,
            prompt: `Parse the following resume text and extract the required fields:\n${rawText}`,
            schema: z.object({
                name: z.string().describe('Full name of the person.'),
                skills: z.string().describe('Comma separated list of hard and soft skills.'),
                experience: z.string().describe('Work history, properly formatted with bullet points.'),
                education: z.string().describe('Educational background.'),
                achievements: z.string().describe('Key achievements or certifications.')
            })
        });

        return NextResponse.json(result.object);

    } catch (error: any) {
        console.error('PDF Extraction Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to extract text from PDF.' }, { status: 500 });
    }
}

