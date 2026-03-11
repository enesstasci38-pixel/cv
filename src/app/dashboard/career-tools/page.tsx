'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, Compass, Lightbulb, ChevronRight } from 'lucide-react';

export default function CareerToolsPage() {
    const [resumeText, setResumeText] = useState('Senior Software Engineer\n- Developed core features\n- Managed a team of 5\nSkills: React, Next.js, Node.js, TypeScript\nAWS Certified Solutions Architect');
    const [jobDescription, setJobDescription] = useState('');

    // States for Interview Prep
    const [loadingInterview, setLoadingInterview] = useState(false);
    const [interviewData, setInterviewData] = useState<any>(null);
    const [interviewError, setInterviewError] = useState('');

    // States for Career Suggestions
    const [loadingCareer, setLoadingCareer] = useState(false);
    const [careerData, setCareerData] = useState<any>(null);
    const [careerError, setCareerError] = useState('');

    const handleGenerateInterview = async () => {
        if (!resumeText.trim()) return;
        setLoadingInterview(true);
        setInterviewError('');
        try {
            const res = await fetch('/api/interview-prep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
            });
            if (!res.ok) throw new Error('Failed to generate interview prep');
            const data = await res.json();
            setInterviewData(data);
        } catch (err: any) {
            setInterviewError(err.message);
        } finally {
            setLoadingInterview(false);
        }
    };

    const handleGenerateCareer = async () => {
        if (!resumeText.trim()) return;
        setLoadingCareer(true);
        setCareerError('');
        try {
            const res = await fetch('/api/career-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resumeText }),
            });
            if (!res.ok) throw new Error('Failed to generate career suggestions');
            const data = await res.json();
            setCareerData(data);
        } catch (err: any) {
            setCareerError(err.message);
        } finally {
            setLoadingCareer(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Career Tools</h1>
                <p className="text-muted-foreground">Prepare for interviews and explore new career paths based on your resume.</p>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Your Resume Context</CardTitle>
                    <CardDescription>We use this content to power the AI tools below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        rows={4}
                        placeholder="Paste resume text..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                    />
                </CardContent>
            </Card>

            <Tabs defaultValue="interview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
                    <TabsTrigger value="interview" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Interview Prep</TabsTrigger>
                    <TabsTrigger value="career" className="flex items-center gap-2"><Compass className="w-4 h-4" /> Career Paths</TabsTrigger>
                </TabsList>

                <TabsContent value="interview" className="space-y-6 animate-in fade-in duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate Interview Prep</CardTitle>
                            <CardDescription>Optionally paste a target job description to get tailored mock questions and STAR-method answers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                rows={4}
                                placeholder="Paste target job description (optional)..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            {interviewError && <div className="text-red-500 text-sm mt-2">{interviewError}</div>}
                            <Button onClick={handleGenerateInterview} disabled={loadingInterview} className="w-full sm:w-auto">
                                {loadingInterview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                                Generate Prep
                            </Button>
                        </CardContent>
                    </Card>

                    {interviewData && interviewData.questions && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold mt-8 mb-4">Your Custom Interview Guide</h3>
                            {interviewData.questions.map((q: any, i: number) => (
                                <Card key={i} className="border-l-4 border-l-primary overflow-hidden">
                                    <CardHeader className="bg-muted/30 pb-4">
                                        <CardTitle className="text-lg leading-tight flex items-start gap-3">
                                            <span className="text-primary font-bold">Q{i + 1}.</span>
                                            {q.question}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                            Suggested STAR Answer <ChevronRight className="w-3 h-3" />
                                        </div>
                                        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-muted">
                                            {q.suggested_answer_star}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="career" className="space-y-6 animate-in fade-in duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Discover Alternative Paths</CardTitle>
                            <CardDescription>See what other roles you might qualify for, or what skills you need to pivot.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {careerError && <div className="text-red-500 text-sm mb-4">{careerError}</div>}
                            <Button onClick={handleGenerateCareer} disabled={loadingCareer} className="w-full sm:w-auto">
                                {loadingCareer ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Compass className="w-4 h-4 mr-2" />}
                                Analyze Options
                            </Button>
                        </CardContent>
                    </Card>

                    {careerData && careerData.suggestions && (
                        <div className="grid md:grid-cols-2 gap-4 mt-8">
                            {careerData.suggestions.map((s: any, i: number) => (
                                <Card key={i} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-primary">{s.job_title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why you fit</h4>
                                            <p className="text-sm">{s.reasoning}</p>
                                        </div>
                                        {s.skill_gaps && s.skill_gaps.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills to learn</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {s.skill_gaps.map((skill: string, j: number) => (
                                                        <span key={j} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md border">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
