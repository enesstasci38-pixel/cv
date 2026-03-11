"use client"

import { useState } from "react"
import { useCompletion } from "@ai-sdk/react"
import { Sparkles, Loader2, Share2, Check, Download, FileText, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

export default function ResumeBuilderPage() {
    const [resumeData, setResumeData] = useState({
        name: "",
        experience: "",
        education: "",
        skills: "",
        achievements: ""
    })

    const [enhancingField, setEnhancingField] = useState<string | null>(null);
    const [atsResult, setAtsResult] = useState<{ score: number, feedback: { strengths: string[], improvements: string[] } } | null>(null);
    const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);

    const [linkedInUrl, setLinkedInUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

    const WEAK_VERBS = ['helped', 'worked', 'did', 'was responsible for', 'managed to', 'tried to', 'assisted', 'handled', 'was asked to', 'duties included'];

    const getWeakVerbs = (text: string) => {
        return WEAK_VERBS.filter(verb => text.toLowerCase().includes(verb.toLowerCase()));
    }

    const { complete, completion, isLoading, error } = useCompletion({
        api: '/api/generate-resume',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setResumeData({ ...resumeData, [e.target.name]: e.target.value })
    }

    const handleEnhance = async (field: 'experience' | 'achievements') => {
        if (!resumeData[field]) return;

        setEnhancingField(field);
        try {
            const response = await fetch('/api/enhance-bullet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: resumeData[field] })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const enhancedText = await response.text();
            setResumeData(prev => ({ ...prev, [field]: enhancedText }));
        } catch (error) {
            console.error("Failed to enhance text", error);
        } finally {
            setEnhancingField(null);
        }
    }

    const handleAtsAnalysis = async () => {
        setIsAnalyzingAts(true);
        try {
            const promptParams = `Name: ${resumeData.name}\nSkills: ${resumeData.skills}\nExperience: ${resumeData.experience}\nEducation: ${resumeData.education}\nAchievements: ${resumeData.achievements}`;
            const response = await fetch('/api/ats-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: promptParams, jobDescription: "" })
            });

            if (!response.ok) throw new Error('Failed to analyze ATS score');

            const data = await response.json();
            setAtsResult(data);
        } catch (error) {
            console.error("Failed to analyze ATS Score", error);
        } finally {
            setIsAnalyzingAts(false);
        }
    }

    const handleLinkedInImport = async () => {
        if (!linkedInUrl) return;

        setIsImporting(true);
        try {
            const response = await fetch('/api/import-linkedin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: linkedInUrl })
            });

            if (!response.ok) throw new Error('Failed to import LinkedIn data');

            const data = await response.json();
            setResumeData(prev => ({
                ...prev,
                name: data.name || prev.name,
                experience: data.experience || prev.experience,
                education: data.education || prev.education,
                skills: data.skills || prev.skills,
                achievements: data.achievements || prev.achievements
            }));
            setLinkedInUrl("");
        } catch (error) {
            console.error("Failed to import LinkedIn profile", error);
        } finally {
            setIsImporting(false);
        }
    }

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingPdf(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/extract-pdf', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to extract PDF data');

            const data = await response.json();
            setResumeData(prev => ({
                ...prev,
                name: data.name || prev.name,
                experience: data.experience || prev.experience,
                education: data.education || prev.education,
                skills: data.skills || prev.skills,
                achievements: data.achievements || prev.achievements
            }));
        } catch (error) {
            console.error("Failed to parse PDF", error);
        } finally {
            setIsUploadingPdf(false);
            e.target.value = ''; // Reset input
        }
    }

    const handleGenerate = async () => {
        const promptParams = `
Name: ${resumeData.name}
Skills: ${resumeData.skills}
Experience: ${resumeData.experience}
Education: ${resumeData.education}
Achievements: ${resumeData.achievements}
`.trim();

        await complete(promptParams);
    }

    const handlePublish = async () => {
        setIsPublishing(true);
        const supabase = createClient();

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) throw new Error("Kullanıcı girişi bulunamadı.");

            // 1. Özgeçmişi kaydet veya güncelle
            const { data: resumeResult, error: resumeErr } = await supabase
                .from('resumes')
                .insert({
                    user_id: userData.user.id,
                    name: resumeData.name,
                    skills: resumeData.skills,
                    experience: resumeData.experience,
                    education: resumeData.education,
                    achievements: resumeData.achievements,
                    ats_score: atsResult?.score || 0
                })
                .select()
                .single();

            if (resumeErr) throw resumeErr;

            // 2. Eşsiz bir link (slug) oluştur ve kaydet
            const slugBase = resumeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const randomCode = Math.floor(Math.random() * 10000).toString();
            const finalSlug = `${slugBase}-${randomCode}`;

            const { error: linkErr } = await supabase
                .from('resume_links')
                .insert({
                    resume_id: resumeResult.id,
                    slug: finalSlug
                });

            if (linkErr) throw linkErr;

            setPublishedUrl(`${window.location.origin}/${finalSlug}`);
        } catch (error: any) {
            console.error("Failed to publish resume", error);
            alert("Hata oluştu: " + error.message);
        } finally {
            setIsPublishing(false);
        }
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-16">
            {/* Header Sticky Bar */}
            <div className="sticky top-0 z-50 -mx-4 px-4 py-4 sm:-mx-8 sm:px-8 bg-background/80 backdrop-blur-xl border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Resume Studio</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Build, optimize, and share your AI-powered profile.
                    </p>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                    <Button onClick={handlePublish} disabled={isPublishing || !resumeData.name} variant="outline" className="flex-1 sm:flex-none border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                        {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (publishedUrl ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Share2 className="mr-2 h-4 w-4" />)}
                        {isPublishing ? "Publishing..." : (publishedUrl ? "Published" : "Publish to Web")}
                    </Button>
                    <Button onClick={handleGenerate} disabled={isLoading} className="flex-1 sm:flex-none bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-primary/25 transition-all">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isLoading ? "Generating..." : "Generate AI Format"}
                    </Button>
                </div>
            </div>

            {publishedUrl && (
                <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-500/20 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div>
                        <p className="font-bold flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            Your interactive resume is live!
                        </p>
                        <p className="text-sm mt-1 opacity-90">Share this magic link with recruiters to stand out.</p>
                    </div>
                    <div className="flex w-full sm:w-auto gap-2">
                        <Input readOnly value={publishedUrl} className="w-full sm:w-72 bg-white/50 dark:bg-black/20 border-emerald-500/20 font-mono text-sm" />
                        <Button
                            variant="default"
                            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                                navigator.clipboard.writeText(publishedUrl);
                            }}
                        >
                            Copy Link
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/50 transition-all hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Linkedin className="w-5 h-5" /> Import LinkedIn
                        </CardTitle>
                        <CardDescription className="text-blue-600/70 dark:text-blue-400/70">Save time by importing your profile data instantly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://linkedin.com/in/username"
                                value={linkedInUrl}
                                onChange={(e) => setLinkedInUrl(e.target.value)}
                                disabled={isImporting || isLoading || isUploadingPdf}
                                className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500"
                            />
                            <Button onClick={handleLinkedInImport} disabled={isImporting || !linkedInUrl || isLoading || isUploadingPdf} variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isImporting ? "Importing..." : "Import"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 border-purple-100 dark:border-purple-900/50 transition-all hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                            <FileText className="w-5 h-5" /> Import PDF
                        </CardTitle>
                        <CardDescription className="text-purple-600/70 dark:text-purple-400/70">Extract text and details from your old PDF.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="pdf-upload"
                                type="file"
                                accept=".pdf"
                                onChange={handlePdfUpload}
                                disabled={isUploadingPdf || isImporting || isLoading}
                                className="cursor-pointer bg-white/50 dark:bg-black/20 border-purple-200 dark:border-purple-800 file:text-purple-700 dark:file:text-purple-400 file:bg-purple-100 dark:file:bg-purple-900/50 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md hover:file:bg-purple-200 transition-all"
                            />
                            {isUploadingPdf && <Loader2 className="h-5 w-5 animate-spin text-purple-600" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-sm">
                    <CardHeader className="pb-4 border-b border-border/20 mb-4">
                        <CardTitle className="text-xl">Core Details</CardTitle>
                        <CardDescription>Tell us who you are and what you know.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" value={resumeData.name} onChange={handleChange} disabled={isLoading} className="h-11 bg-background/50 focus-visible:bg-background" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="skills" className="text-sm font-semibold text-foreground/80">Technical Skills (comma separated)</Label>
                            <Input id="skills" name="skills" placeholder="React, Next.js, Node.js..." value={resumeData.skills} onChange={handleChange} disabled={isLoading} className="h-11 bg-background/50 focus-visible:bg-background" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="education" className="text-sm font-semibold text-foreground/80">Education</Label>
                            <Input id="education" name="education" placeholder="B.S. Computer Science, University of Examples..." value={resumeData.education} onChange={handleChange} disabled={isLoading} className="h-11 bg-background/50 focus-visible:bg-background" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-sm">
                    <CardHeader className="pb-4 border-b border-border/20 mb-4">
                        <CardTitle className="text-xl">Experience & Impact</CardTitle>
                        <CardDescription>Detail your work history and major wins.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="experience" className="text-sm font-semibold text-foreground/80">Professional Experience</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEnhance('experience')}
                                    disabled={enhancingField === 'experience' || !resumeData.experience || isLoading}
                                    className="h-7 text-xs px-3 font-medium text-violet-600 bg-violet-100 hover:bg-violet-200 hover:text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    {enhancingField === 'experience' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                    AI Enhance
                                </Button>
                            </div>
                            <Textarea id="experience" name="experience" placeholder="Software Engineer at TechCorp...&#10;- Built a scalable microservice architecture...&#10;- Increased performance by 40%..." value={resumeData.experience} onChange={handleChange} disabled={isLoading} className="min-h-[140px] resize-y bg-background/50 focus-visible:bg-background" />
                            {getWeakVerbs(resumeData.experience).length > 0 && (
                                <p className="text-[13px] text-amber-600 dark:text-amber-500 mt-2 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md border border-amber-200 dark:border-amber-900/50">
                                    <span className="font-semibold mr-1">Tip:</span>
                                    Replace weak verbs like <span className="font-bold underline decoration-amber-300 underline-offset-2">({getWeakVerbs(resumeData.experience).join(', ')})</span>. Hit "AI Enhance" to upgrade them!
                                </p>
                            )}
                        </div>
                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="achievements" className="text-sm font-semibold text-foreground/80">Key Achievements</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEnhance('achievements')}
                                    disabled={enhancingField === 'achievements' || !resumeData.achievements || isLoading}
                                    className="h-7 text-xs px-3 font-medium text-violet-600 bg-violet-100 hover:bg-violet-200 hover:text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    {enhancingField === 'achievements' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                    AI Enhance
                                </Button>
                            </div>
                            <Textarea id="achievements" name="achievements" placeholder="Led a team of 5 engineers to deliver Q3 roadmap early..." value={resumeData.achievements} onChange={handleChange} disabled={isLoading} className="min-h-[100px] bg-background/50 focus-visible:bg-background" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {atsResult && (
                <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 animate-in fade-in zoom-in-95 duration-500">
                    <Card className="border-0 shadow-none bg-background/95 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center justify-between">
                                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">ATS Optimization Report</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-foreground">{atsResult.score}</span>
                                    <span className="text-muted-foreground font-medium">/100</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6 pt-2">
                            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/10">
                                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Passed Checks
                                </h4>
                                <ul className="space-y-2 text-sm text-emerald-900/80 dark:text-emerald-300/80">
                                    {atsResult.feedback.strengths.map((s, i) => (
                                        <li key={i} className="flex gap-2"><span className="text-emerald-500 mt-0.5">•</span> <span>{s}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-rose-500/5 dark:bg-rose-500/10 p-4 rounded-xl border border-rose-500/10">
                                <h4 className="font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Action Items
                                </h4>
                                <ul className="space-y-2 text-sm text-rose-900/80 dark:text-rose-300/80">
                                    {atsResult.feedback.improvements.map((s, i) => (
                                        <li key={i} className="flex gap-2"><span className="text-rose-500 mt-0.5">•</span> <span>{s}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="border-primary/20 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-muted/50 via-muted to-muted/50 h-1 w-full" />
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/20">
                    <div>
                        <CardTitle className="text-xl">Preview & Score</CardTitle>
                        <CardDescription>Visualize the ATS-ready format or check your match score.</CardDescription>
                    </div>
                    <Button variant="secondary" onClick={handleAtsAnalysis} disabled={isAnalyzingAts || !resumeData.experience} className="font-semibold shadow-sm hover:shadow-md transition-shadow">
                        {isAnalyzingAts ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> : <Sparkles className="mr-2 h-4 w-4 text-primary" />}
                        {isAnalyzingAts ? "Analyzing..." : "Analyze ATS Score"}
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    {error && (
                        <div className="p-4 mb-4 text-sm text-rose-800 rounded-lg bg-rose-50 border border-rose-200">
                            <strong>Generation Error:</strong> {error.message}
                        </div>
                    )}
                    <div className="min-h-[300px] rounded-xl border border-border/50 bg-background shadow-inner p-8 flex flex-col font-serif md:text-lg text-muted-foreground transition-all">
                        {completion ? (
                            <div className="w-full text-foreground prose dark:prose-invert max-w-none">
                                {completion}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                                <FileText className="w-12 h-12 text-muted-foreground/50" />
                                <p className="font-medium font-sans max-w-[250px]">
                                    Click "Generate AI Format" from the top menu to preview the tailored content.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
