'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Target, CheckCircle2, XCircle } from 'lucide-react';

type MatchResult = {
    match_score: number;
    missing_keywords: string[];
    matching_skills: string[];
};

export default function MatchScorePage() {
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('Senior Software Engineer\n- Developed core features\n- Managed a team of 5\nSkills: React, Next.js, Node.js, TypeScript\nAWS Certified Solutions Architect');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MatchResult | null>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!jobDescription.trim() || !resumeText.trim()) {
            setError('Both Resume Text and Job Description are required.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/match-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
            });

            if (!res.ok) {
                throw new Error('Analysis failed');
            }

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-1">Job Match Score</h1>
                <p className="text-muted-foreground text-lg">Compare your resume against a job description to see your fit.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Resume</CardTitle>
                        <CardDescription>Paste your latest resume content here</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            rows={10}
                            placeholder="Paste resume text..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Job Description</CardTitle>
                        <CardDescription>Paste the job posting requirements here</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            rows={10}
                            placeholder="Paste job description..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </CardContent>
                </Card>
            </div>

            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{error}</div>}

            <div className="flex justify-center">
                <Button size="lg" onClick={handleAnalyze} disabled={loading} className="w-full md:w-auto px-8">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Target className="h-5 w-5 mr-2" />}
                    {loading ? 'Analyzing Fit...' : 'Calculate Match Score'}
                </Button>
            </div>

            {result && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-primary/20 bg-muted/30">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl">Analysis Complete</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-muted">
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                        <circle
                                            cx="60" cy="60" r="56"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className={result.match_score >= 80 ? 'text-green-500' : result.match_score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                                            strokeDasharray="351.858"
                                            strokeDashoffset={351.858 - (351.858 * result.match_score) / 100}
                                        />
                                    </svg>
                                    <span className="text-4xl font-bold">{result.match_score}%</span>
                                </div>
                                <p className="mt-4 text-muted-foreground font-medium">
                                    {result.match_score >= 80 ? 'Excellent Match! You should definitely apply.' : result.match_score >= 60 ? 'Good Match. Consider adding missing keywords.' : 'Low Match. Significant customization needed.'}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3 p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                    <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" /> Matching Skills
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.matching_skills.length > 0 ? result.matching_skills.map((skill, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-green-500 mt-0.5">•</span>
                                                <span>{skill}</span>
                                            </li>
                                        )) : <li className="text-sm text-muted-foreground italic">None identified</li>}
                                    </ul>
                                </div>

                                <div className="space-y-3 p-4 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                    <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                                        <XCircle className="h-5 w-5" /> Missing Keywords
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.missing_keywords.length > 0 ? result.missing_keywords.map((keyword, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span>{keyword}</span>
                                            </li>
                                        )) : <li className="text-sm text-muted-foreground italic">None identified</li>}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
