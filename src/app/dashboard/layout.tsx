import { ReactNode } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen w-full flex-col relative bg-background">
            {/* Subtle premium background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/70 backdrop-blur-xl px-4 md:px-6 shadow-sm">
                <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <a href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary">
                        ResumeAI
                    </a>
                    <a href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                        Resumes
                    </a>
                    <a href="/dashboard/cover-letter" className="text-muted-foreground transition-colors hover:text-foreground">
                        Cover Letters
                    </a>
                    <a href="/dashboard/job-tracker" className="text-muted-foreground transition-colors hover:text-foreground">
                        Job Tracker
                    </a>
                    <a href="/dashboard/match-score" className="text-muted-foreground transition-colors hover:text-foreground">
                        Match Score
                    </a>
                    <a href="/dashboard/career-tools" className="text-muted-foreground transition-colors hover:text-foreground">
                        Career Tools
                    </a>
                    <a href="/dashboard/analytics" className="text-muted-foreground transition-colors hover:text-foreground">
                        Analytics
                    </a>
                </nav>
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden md:inline-flex">{user.email}</span>
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="text-sm font-medium hover:underline text-destructive px-2 py-1">Sign Out</button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 z-10 w-full max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
