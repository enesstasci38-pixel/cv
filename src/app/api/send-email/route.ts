import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { to, subject, html } = await request.json();

        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Resend test domain
            to: to || 'enesstasci38@gmail.com', // Kullanıcıdan gelen e-posta veya varsayılan
            subject: subject || 'Hello World',
            html: html || '<p>Congrats on sending your <strong>first email</strong>!</p>',
        });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
