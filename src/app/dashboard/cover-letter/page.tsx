"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Sparkles, Loader2, FileType, Copy, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function CoverLetterPage() {
    const [formData, setFormData] = useState({
        resumeText: "",
        jobDescription: "",
        companyName: "",
        hiringManager: "",
        tone: "professional"
    });

    const [isCopied, setIsCopied] = useState(false);

    // useCompletion uses /api/completion by default but we map it to our endpoint
    const { complete, completion, isLoading, error } = useCompletion({
        api: '/api/generate-cover-letter',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        if (!formData.resumeText || !formData.jobDescription) return;

        const promptParams = `
Resume Context:
${formData.resumeText}

Job Description:
${formData.jobDescription}

Target Company: ${formData.companyName}
Hiring Manager (if known): ${formData.hiringManager}
Preferred Tone: ${formData.tone}
        `.trim();

        await complete(promptParams);
    };

    const handleCopy = () => {
        if (completion) {
            navigator.clipboard.writeText(completion);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent flex items-center gap-2">
                        <FileType className="w-8 h-8 text-violet-500" />
                        AI Cover Letter Draft
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Tailor your cover letter instantly for any job application.
                    </p>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !formData.resumeText || !formData.jobDescription}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg transition-all"
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isLoading ? "Drafting..." : "Generate Cover Letter"}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Application Details</CardTitle>
                            <CardDescription>Provide context for the AI to personalize the letter.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="resumeText" className="text-sm font-semibold">Your Core Experience / Resume Text</Label>
                                <Textarea
                                    id="resumeText"
                                    name="resumeText"
                                    placeholder="Paste your resume text or a summary of your skills and experience here..."
                                    value={formData.resumeText}
                                    onChange={handleChange}
                                    className="min-h-[120px] bg-background/50 focus-visible:bg-background resize-y"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jobDescription" className="text-sm font-semibold">Job Description</Label>
                                <Textarea
                                    id="jobDescription"
                                    name="jobDescription"
                                    placeholder="Paste the job description you are applying for..."
                                    value={formData.jobDescription}
                                    onChange={handleChange}
                                    className="min-h-[120px] bg-background/50 focus-visible:bg-background resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName" className="text-sm font-semibold">Target Company</Label>
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        placeholder="e.g. Google, Stripe"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="bg-background/50 focus-visible:bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hiringManager" className="text-sm font-semibold">Hiring Manager (Optional)</Label>
                                    <Input
                                        id="hiringManager"
                                        name="hiringManager"
                                        placeholder="e.g. Jane Doe"
                                        value={formData.hiringManager}
                                        onChange={handleChange}
                                        className="bg-background/50 focus-visible:bg-background"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="tone" className="text-sm font-semibold">Tone of Voice</Label>
                                <select
                                    id="tone"
                                    name="tone"
                                    value={formData.tone}
                                    onChange={handleChange as any}
                                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="professional">Professional & Formal</option>
                                    <option value="confident">Confident & Direct</option>
                                    <option value="enthusiastic">Enthusiastic & Passionate</option>
                                    <option value="creative">Creative & Unconventional</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="h-full flex flex-col border-primary/20 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-50/50 to-fuchsia-50/50 dark:from-indigo-950/20 dark:to-fuchsia-950/20 backdrop-blur-xl">
                        <div className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 h-1 w-full" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="w-5 h-5 text-fuchsia-600" />
                                    Generated Output
                                </CardTitle>
                                <CardDescription>Your tailored letter ready for review.</CardDescription>
                            </div>
                            {completion && (
                                <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
                                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    {isCopied ? "Copied" : "Copy"}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 p-0 px-6 pb-6 mt-4">
                            {error && (
                                <div className="p-4 mb-4 text-sm text-rose-800 rounded-lg bg-rose-50 border border-rose-200">
                                    <strong>Error:</strong> {error.message}
                                </div>
                            )}

                            <div className="min-h-[400px] h-full rounded-xl border border-border/50 bg-background/80 shadow-inner p-6 font-serif text-base leading-relaxed text-foreground transition-all flex flex-col">
                                {completion ? (
                                    <div className="whitespace-pre-wrap flex-1 prose dark:prose-invert max-w-none">
                                        {completion}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                        <FileType className="w-16 h-16 text-muted-foreground/30" />
                                        <p className="font-sans max-w-[280px]">
                                            Fill out the application details and click generate to create a highly tailored cover letter.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 
