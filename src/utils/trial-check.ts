import { createClient } from '@/utils/supabase/server';

export async function isTrialExpiredAndUnsubscribed(userId: string): Promise<boolean> {
    const supabase = await createClient();

    // 1. Check profile trial expiration
    const { data: profile } = await supabase
        .from('users')
        .select('trial_ends_at')
        .eq('id', userId)
        .single();

    if (!profile || !profile.trial_ends_at) {
        // Assume active if no profile found (failsafe)
        return false;
    }

    const trialEndsAt = new Date(profile.trial_ends_at);
    const now = new Date();

    if (now <= trialEndsAt) {
        // Still in trial
        return false;
    }

    // 2. If trial expired, check for active subscription
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

    if (subscription) {
        // Has active subscription
        return false;
    }

    // Trial expired and no active subscription
    return true;
}
