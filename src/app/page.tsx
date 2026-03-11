import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckoutButton } from '@/components/checkout-button'
import { Meteors } from '@/components/ui/meteors'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid'
import { BriefcaseBusiness, FileText, Sparkles, Share2 } from 'lucide-react'

const features = [
  {
    Icon: Sparkles,
    name: "AI-Powered Bullet Points",
    description: "Generate highly converting bullet points tailored to the job description in seconds.",
    href: "/login",
    cta: "Try it out",
    background: <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 dark:from-violet-900/40 dark:to-fuchsia-900/40" />,
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: FileText,
    name: "ATS-Optimized Formatting",
    description: "Ensure your resume passes Applicant Tracking Systems and gets seen by real humans.",
    href: "/login",
    cta: "Build Resume",
    background: <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-900/40 dark:to-cyan-900/40" />,
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: BriefcaseBusiness,
    name: "Job Strategy Tracker",
    description: "Track your applications, analyze match scores, and optimize for your dream roles.",
    href: "/login",
    cta: "Track Jobs",
    background: <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-900/40 dark:to-teal-900/40" />,
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: Share2,
    name: "Public Link Sharing",
    description: "Stop attaching PDFs. Send recruiters a direct link to your interactive resume.",
    href: "/login",
    cta: "Share Link",
    background: <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-900/40 dark:to-red-900/40" />,
    className: "col-span-3 lg:col-span-1",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Background Effect */}
      <Meteors number={30} />

      {/* Hero Section */}
      <main className="relative z-10 flex w-full max-w-6xl flex-col items-center px-4 pt-24 pb-16 text-center space-y-10">
        <div className="flex items-center justify-center">
          <div className="group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800">
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Introducing ResumeAI 2.0</span>
            </AnimatedShinyText>
          </div>
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
          Stop sending PDFs.
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
            Send your resume as a link.
          </span>
        </h1>

        <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
          Optimize your resume for specific jobs with AI, land more interviews, and share your profile instantly with a live, tracking-enabled link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)] transition-all hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.8)] rounded-full">
              Get Started for Free
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full bg-background/50 backdrop-blur-md">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Features Bento Grid */}
        <div className="w-full pt-20">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Premium Features</h2>
          <BentoGrid className="mx-auto">
            {features.map((feature, i) => (
              <BentoCard key={i} {...feature} />
            ))}
          </BentoGrid>
        </div>

        {/* Pricing Block */}
        <div className="mt-24 max-w-md w-full relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-20 blur transition duration-1000 group-hover:opacity-40 group-hover:duration-200" />
          <div className="relative space-y-4 text-center bg-card/60 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-2xl">
            <p className="text-xl font-bold text-foreground">Pro Access (Yearly)</p>
            <div className="flex items-center justify-center gap-3 text-3xl">
              <span className="line-through text-muted-foreground opacity-60">$129</span>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">$109</span>
            </div>
            <p className="font-medium text-primary">Save $20 — Early Adopter Price</p>
            <p className="text-sm text-muted-foreground pt-2">Lock in $109/year forever. Price increases to $129/year soon.</p>
            <div className="pt-6 flex justify-center w-full">
              <CheckoutButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
