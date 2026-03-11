import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Ensure we only update the fields that are allowed
        const updateData: any = {};
        if (body.company_name !== undefined) updateData.company = body.company_name;
        if (body.job_title !== undefined) updateData.title = body.job_title;
        if (body.job_link !== undefined) updateData.url = body.job_link;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.application_date !== undefined) updateData.applied_date = body.application_date;

        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('job_tracker')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id) // Security: only update their own job
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

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
        .from('job_tracker')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
