import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    const supabase = await createClient();

    try {
        const body = await req.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username (slug) required' }, { status: 400 });
        }

        // Extract some basic analytics data
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const { error } = await supabase
            .from('resume_views')
            .insert({
                slug: username,
                viewer_ip: ip,
                user_agent: userAgent
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        // We return 200 even on error so tracking failure doesn't crash UI, but log it server side
        console.error("Analytics Error", e);
        return NextResponse.json({ success: false, error: e.message });
    }
}
