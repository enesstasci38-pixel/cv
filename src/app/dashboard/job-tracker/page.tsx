'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Briefcase, Calendar, Link as LinkIcon, Building2, Trash2 } from 'lucide-react';

type Job = {
    id: string;
    company_name: string;
    job_title: string;
    job_link: string | null;
    application_date: string;
    status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
    created_at: string;
};

export default function JobTrackerPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New Job Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newCompany, setNewCompany] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newLink, setNewLink] = useState('');
    const [newStatus, setNewStatus] = useState<string>('Applied');

    // Default to today's date formatted for input type="date"
    const [newDate, setNewDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/job-tracker');
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();
            setJobs(data.jobs || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setError('');

        try {
            const res = await fetch('/api/job-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: newCompany,
                    job_title: newTitle,
                    job_link: newLink,
                    status: newStatus,
                    application_date: newDate,
                }),
            });

            if (!res.ok) throw new Error('Failed to add job');

            // Reset form
            setNewCompany('');
            setNewTitle('');
            setNewLink('');
            setNewStatus('Applied');

            // Refresh list
            await fetchJobs();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateStatus = async (jobId: string, newStatus: string) => {
        // Optimistic update
        setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus as Job['status'] } : job));

        try {
            await fetch(`/api/job-tracker/${jobId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            console.error('Failed to update status', err);
            // Revert on failure
            fetchJobs();
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job track?')) return;

        // Optimistic delete
        setJobs(jobs.filter(job => job.id !== jobId));

        try {
            await fetch(`/api/job-tracker/${jobId}`, {
                method: 'DELETE',
            });
        } catch (err) {
            console.error('Failed to delete job', err);
            fetchJobs();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Applied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Interview': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Offer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
    };

    if (loading) {
        return <div className="flex flex-col h-[50vh] items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Loading your applications...</p></div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-1">Job Tracker</h1>
                <p className="text-muted-foreground text-lg">Keep track of all your job applications in one place.</p>
            </div>

            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{error}</div>}

            <Card className="border-primary/20 bg-muted/30">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5 text-primary" /> Add New Application</CardTitle>
                    <CardDescription>Track a new job you applied to today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="space-y-2 md:col-span-3">
                            <Label htmlFor="company">Company *</Label>
                            <Input id="company" required value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Google" />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                            <Label htmlFor="title">Job Title *</Label>
                            <Input id="title" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Frontend Engineer" />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                            <Label htmlFor="link">Link</Label>
                            <Input id="link" type="url" value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="space-y-2 md:col-span-3 pb-1 md:pb-0">
                            <Button type="submit" disabled={isAdding} className="w-full">
                                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Job'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 mt-8">
                {jobs.length === 0 ? (
                    <div className="text-center p-12 border rounded-xl bg-muted/10 border-dashed mt-4">
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                        <h3 className="text-xl font-medium">No applications tracked yet</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Start tracking your job search by adding your first application using the form above.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row p-5 md:items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{job.job_title}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5 font-medium text-foreground"><Building2 className="h-4 w-4 text-primary/70" /> {job.company_name}</div>
                                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary/50" /> {formatDate(job.application_date)}</div>
                                        {job.job_link && (
                                            <a href={job.job_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                                <LinkIcon className="h-4 w-4" /> View Posting
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 md:mt-0 pt-4 border-t md:border-t-0 md:pt-0">
                                    <select
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={job.status}
                                        onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(job.id)}>
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
