import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Mail, Lock } from "lucide-react";
import { isTrialExpiredAndUnsubscribed } from "@/utils/trial-check";
import ViewTracker from "./view-tracker";
import RecruiterActions from "./client-actions";

export default async function PublicResumePage({ params }: { params: { username: string } }) {
    // Await params since it's a promise in Next.js 15+
    const username = (await params).username;
    const supabase = await createClient();

    // Load link and resume details
    const { data: linkInfo, error: linkErr } = await supabase
        .from('resume_links')
        .select('*, resumes(*)')
        .eq('slug', username)
        .single();

    if (linkErr || !linkInfo || !linkInfo.is_active) {
        notFound();
    }

    const { resumes: mockResume } = linkInfo;
    const isLocked = await isTrialExpiredAndUnsubscribed(mockResume.user_id);

    if (isLocked) {
        return (
            <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
                <div className="bg-white dark:bg-neutral-950 border p-8 md:p-12 rounded-2xl max-w-md w-full text-center space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-x-0 -top-10 h-24 bg-red-500/10 blur-xl rounded-full"></div>
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Resume Expired</h1>
                        <p className="text-muted-foreground text-sm">
                            The trial period for this resume has expired and the owner does not have an active subscription.
                        </p>
                    </div>
                    <div className="pt-4 border-t">
                        <Button className="w-full" asChild>
                            <a href="/dashboard">Upgrade to Unlock</a>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
            <ViewTracker username={username} />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Recruiter Actions Bar */}
                <div className="bg-white dark:bg-neutral-900 border rounded-lg p-4 flex items-center justify-between shadow-sm sticky top-4 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                            {mockResume?.name ? mockResume.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <h3 className="font-semibold">{mockResume?.name || 'User'}'s Resume</h3>
                            <p className="text-xs text-muted-foreground">Looking for opportunities</p>
                        </div>
                    </div>
                    <RecruiterActions email={mockResume.email || 'contact@resumeai.com'} />
                </div>

                {/* Actual Resume View */}
                <div className="bg-white dark:bg-neutral-900 border rounded-lg p-8 md:p-12 shadow-sm min-h-[800px]">
                    <h1 className="text-4xl font-bold mb-2">{mockResume?.name || 'Untitled Resume'}</h1>
                    <p className="text-muted-foreground mb-8">Generated via ResumeAI</p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Skills</h2>
                            <p className="whitespace-pre-wrap">{mockResume.skills}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Experience</h2>
                            <p className="whitespace-pre-wrap">{mockResume.experience}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Education</h2>
                            <p className="whitespace-pre-wrap">{mockResume.education}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Achievements</h2>
                            <p className="whitespace-pre-wrap">{mockResume.achievements}</p>
                        </section>
                    </div>
                </div>

                {/* Viral Badge */}
                <div className="text-center pt-8 pb-4">
                    <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"></span>
                        Powered by ResumeAI — Create yours
                    </a>
                </div>
            </div>
        </div>
    );
}
