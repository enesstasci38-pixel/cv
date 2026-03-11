import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, MoreVertical, Globe, Edit, Trash2, Eye, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardPage() {
    const supabase = await createClient();

    // Authorization
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return <div className="p-8">Oturum açmanız gerekiyor.</div>;
    }

    // Kullanıcının özgeçmişlerini ve ona bağlı public link detaylarını getir
    const { data: resumes } = await supabase
        .from('resumes')
        .select(`
            id,
            name,
            ats_score,
            updated_at,
            resume_links(slug, views)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    return (
        <div className="space-y-8 relative">
            {/* Background Glows */}
            <div className="pointer-events-none absolute -inset-x-20 -top-20 -z-10 h-[300px] bg-gradient-to-b from-primary/10 to-transparent blur-3xl" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent pb-2">Your Resumes</h2>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Manage and edit your resumes. Optimize for your next dream job.
                    </p>
                </div>
                <Link href="/dashboard/builder">
                    <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto">
                        <Plus className="w-5 h-5 mr-2" /> Create New Resume
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Dynamic Resumes Map */}
                {resumes?.map((resume) => {
                    // resumes tablosundan çekilen resume_links bir array döner
                    const publicLink = Array.isArray(resume.resume_links) && resume.resume_links.length > 0
                        ? resume.resume_links[0]
                        : null;

                    return (
                        <Card key={resume.id} className="group relative flex flex-col overflow-hidden bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            <CardHeader className="pb-2 relative z-10">
                                <div className="flex justify-between items-start">
                                    {publicLink ? (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 mb-2 border-emerald-200/20 transition-colors">
                                            <Globe className="w-3 h-3 mr-1" />
                                            Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground mb-2 bg-muted/50">Draft</Badge>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-xl line-clamp-1 font-bold group-hover:text-primary transition-colors">{resume.name || "Untitled Resume"}</CardTitle>
                                <CardDescription className="text-xs">Last updated: {new Date(resume.updated_at).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 relative z-10 pt-4">
                                {publicLink ? (
                                    <div className="space-y-3">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                            <span>{publicLink.views || 0} Views</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg truncate border border-border/50">
                                            app.resumeai.com/u/{publicLink.slug}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground">ATS Score</div>
                                        <div className="flex items-end gap-1">
                                            <span className="text-3xl font-extrabold text-foreground">{resume.ats_score || 0}</span>
                                            <span className="text-sm mb-1 text-muted-foreground">/100</span>
                                        </div>
                                        {/* Fake Progress Bar Segment */}
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                                                style={{ width: `${resume.ats_score || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t border-border/50 bg-muted/20 pt-4 relative z-10">
                                <Link href={`/dashboard/builder?id=${resume.id}`}>
                                    <Button variant="secondary" size="sm" className="font-medium bg-background/50 hover:bg-background">
                                        <Edit className="w-4 h-4 mr-2" /> {publicLink ? "Edit" : "Continue"}
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}

                {/* Create New Card */}
                <Card className="group flex flex-col items-center justify-center h-[280px] border-2 border-dashed border-border/60 hover:border-primary/50 bg-transparent hover:bg-primary/5 cursor-pointer transition-all duration-300">
                    <CardHeader className="text-center pb-2">
                        <div className="w-14 h-14 bg-muted group-hover:bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                            <Plus className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">New Resume</CardTitle>
                        <CardDescription className="pt-2 max-w-[200px] mx-auto">
                            Start building your next AI-optimized resume.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Link href="/dashboard/builder">
                            <Button className="rounded-full rounded-r-full" variant="default">Create Resume</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
