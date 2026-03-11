import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('job_tracker')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_date', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedJobs = data?.map(job => ({
        ...job,
        company_name: job.company,
        job_title: job.title,
        job_link: job.url,
        application_date: job.applied_date
    })) || [];

    return NextResponse.json({ jobs: mappedJobs });
}

export async function POST(req: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { company_name, job_title, job_link, status, application_date } = body;

        const { data, error } = await supabase
            .from('job_tracker')
            .insert({
                user_id: user.id,
                company: company_name,
                title: job_title,
                url: job_link || null,
                status: status || 'Applied',
                applied_date: application_date || new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            job: {
                ...data,
                company_name: data.company,
                job_title: data.title,
                job_link: data.url,
                application_date: data.applied_date
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
