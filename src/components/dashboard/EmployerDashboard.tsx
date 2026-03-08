import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Briefcase, Users, Bell, Plus, Sparkles, Loader2, Trophy, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/useJobs";

const EmployerDashboard = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { notifications, unreadCount } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "jobs";
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [rankingJobId, setRankingJobId] = useState<string | null>(null);
  const [ranking, setRanking] = useState(false);

  const { data: employer, isLoading: empLoading } = useQuery({
    queryKey: ["employer", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("employers").select("*").eq("user_id", user!.id).single();
      if (error && error.code === "PGRST116") return null;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [companyForm, setCompanyForm] = useState({ company_name: "", company_description: "", industry: "", website: "", location: "" });
  const createEmployer = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("employers").insert({ user_id: user!.id, ...companyForm });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employer"] }); toast.success("Company profile created!"); },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["employer-jobs", employer?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("employer_id", employer!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employer,
  });

  const [jobForm, setJobForm] = useState({ title: "", description: "", type: "internship", industry: "", location: "", salary_range: "", remote: false, required_skills: "", requirements: "", responsibilities: "", deadline: "" });

  const createJob = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("jobs").insert({
        employer_id: employer!.id, title: jobForm.title, description: jobForm.description, type: jobForm.type,
        industry: jobForm.industry, location: jobForm.location, salary_range: jobForm.salary_range, remote: jobForm.remote,
        required_skills: jobForm.required_skills.split(",").map(s => s.trim()).filter(Boolean),
        requirements: jobForm.requirements.split("\n").filter(Boolean),
        responsibilities: jobForm.responsibilities.split("\n").filter(Boolean),
        deadline: jobForm.deadline || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      toast.success("Job posted! Awaiting admin approval.");
      setJobDialogOpen(false);
      setJobForm({ title: "", description: "", type: "internship", industry: "", location: "", salary_range: "", remote: false, required_skills: "", requirements: "", responsibilities: "", deadline: "" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: applicants = [] } = useQuery({
    queryKey: ["employer-applicants", employer?.id, jobs],
    queryFn: async () => {
      const jobIds = jobs.map((j: any) => j.id);
      if (jobIds.length === 0) return [];
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(title, required_skills), profiles:user_id(first_name, last_name, university_name, resume_url, github_url, bio)")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employer && jobs.length > 0,
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status, rank }: { id: string; status?: string; rank?: number }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (rank !== undefined) updates.employer_rank = rank;
      const { error } = await supabase.from("applications").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employer-applicants"] }); toast.success("Updated!"); },
  });

  const handleAIRank = async (jobId: string) => {
    setRankingJobId(jobId);
    setRanking(true);
    const job = jobs.find((j: any) => j.id === jobId);
    const jobApplicants = applicants.filter((a: any) => a.job_id === jobId);
    if (jobApplicants.length === 0) { toast.error("No applicants to rank"); setRanking(false); return; }

    const applicantSummaries = jobApplicants.map((a: any, i: number) => 
      `Applicant ${i + 1} (ID: ${a.id}): ${(a as any).profiles?.first_name} ${(a as any).profiles?.last_name}, University: ${(a as any).profiles?.university_name || "N/A"}, Bio: ${(a as any).profiles?.bio || "N/A"}`
    ).join("\n");

    try {
      const response = await supabase.functions.invoke("ai-tools", {
        body: {
          type: "rank-candidates",
          jobTitle: job?.title,
          jobSkills: job?.required_skills?.join(", ") || "",
          applicantSummaries,
        },
      });
      if (response.error) throw response.error;

      // Parse rankings from AI response and update
      const content = response.data.content;
      const rankMatches = content.match(/Applicant \d+ \(ID: ([^)]+)\).*?Score[:\s]*(\d+)/gi);
      if (rankMatches) {
        for (const match of rankMatches) {
          const idMatch = match.match(/ID: ([^)]+)/);
          const scoreMatch = match.match(/Score[:\s]*(\d+)/i);
          if (idMatch && scoreMatch) {
            await supabase.from("applications").update({
              employer_rank: parseInt(scoreMatch[1]),
              match_score: parseInt(scoreMatch[1]),
            }).eq("id", idMatch[1]);
          }
        }
        queryClient.invalidateQueries({ queryKey: ["employer-applicants"] });
      }
      toast.success("Candidates ranked by AI!");
    } catch (err: any) {
      toast.error(err.message || "Ranking failed");
    } finally {
      setRanking(false);
      setRankingJobId(null);
    }
  };

  if (empLoading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  if (!employer) {
    return (
      <div className="container py-12 max-w-lg">
        <Card>
          <CardHeader><CardTitle>Create Your Company Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Company Name</Label><Input value={companyForm.company_name} onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })} /></div>
            <div><Label>Industry</Label><Input value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={companyForm.location} onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })} /></div>
            <div><Label>Website</Label><Input value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={companyForm.company_description} onChange={(e) => setCompanyForm({ ...companyForm, company_description: e.target.value })} /></div>
            <Button onClick={() => createEmployer.mutate()} disabled={!companyForm.company_name}>Create Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedApplicants = [...applicants].sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0));

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{employer.company_name}</h1>
          <p className="text-muted-foreground">Employer Dashboard {!employer.is_verified && <Badge variant="outline">Pending Verification</Badge>}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Post Job</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Post a New Job</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Job Title</Label><Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={4} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Type</Label>
                    <Select value={jobForm.type} onValueChange={(v) => setJobForm({ ...jobForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="trainee">Trainee</SelectItem>
                        <SelectItem value="entry-level">Entry Level</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Industry</Label><Input value={jobForm.industry} onChange={(e) => setJobForm({ ...jobForm, industry: e.target.value })} /></div>
                  <div><Label>Location</Label><Input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} /></div>
                  <div><Label>Salary Range</Label><Input value={jobForm.salary_range} onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })} placeholder="KES 40,000 - 60,000" /></div>
                </div>
                <div><Label>Required Skills (comma separated)</Label><Input value={jobForm.required_skills} onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })} placeholder="JavaScript, React, Node.js" /></div>
                <div><Label>Requirements (one per line)</Label><Textarea value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} rows={3} /></div>
                <div><Label>Responsibilities (one per line)</Label><Textarea value={jobForm.responsibilities} onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })} rows={3} /></div>
                <div><Label>Application Deadline</Label><Input type="date" value={jobForm.deadline} onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })} /></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={jobForm.remote} onChange={(e) => setJobForm({ ...jobForm, remote: e.target.checked })} />
                  <Label>Remote position</Label>
                </div>
                <Button onClick={() => createJob.mutate()} disabled={!jobForm.title || !jobForm.description} className="w-full">Post Job</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs" className="gap-1"><Briefcase className="h-4 w-4" /> Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applicants" className="gap-1"><Users className="h-4 w-4" /> Applicants ({applicants.length})</TabsTrigger>
          <TabsTrigger value="ranking" className="gap-1"><Trophy className="h-4 w-4" /> AI Ranking</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1 relative"><Bell className="h-4 w-4" /> Alerts
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">{unreadCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          {jobs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No jobs posted yet. Click "Post Job" to get started.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {jobs.map((job: any) => (
                <Card key={job.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{job.type}</Badge>
                        {job.is_approved ? <Badge className="bg-primary/20 text-primary">Approved</Badge> : <Badge variant="outline">Pending</Badge>}
                        <span className="text-sm text-muted-foreground">{job.applicant_count || 0} applicants</span>
                      </div>
                    </div>
                    <Badge variant={job.is_active ? "default" : "secondary"}>{job.is_active ? "Active" : "Closed"}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applicants">
          {applicants.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No applicants yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {applicants.map((app: any) => (
                <Card key={app.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{(app as any).profiles?.first_name} {(app as any).profiles?.last_name}</p>
                      <p className="text-sm text-muted-foreground">Applied for: {app.jobs?.title}</p>
                      <p className="text-sm text-muted-foreground">{(app as any).profiles?.university_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.match_score && <Badge className="bg-primary/20 text-primary">{app.match_score}% match</Badge>}
                      <Select value={app.status} onValueChange={(v) => updateApplicationStatus.mutate({ id: app.id, status: v })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="offered">Offered</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /> AI Candidate Ranking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Select a job to rank its applicants using AI based on skills, experience, and job fit.</p>
              <div className="flex flex-wrap gap-2">
                {jobs.map((job: any) => {
                  const count = applicants.filter((a: any) => a.job_id === job.id).length;
                  return (
                    <Button key={job.id} variant={rankingJobId === job.id ? "default" : "outline"} size="sm" onClick={() => handleAIRank(job.id)}
                      disabled={ranking || count === 0}>
                      {ranking && rankingJobId === job.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                      {job.title} ({count})
                    </Button>
                  );
                })}
              </div>

              {sortedApplicants.filter((a: any) => a.match_score).length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="font-display font-semibold flex items-center gap-2"><ArrowUpDown className="h-4 w-4" /> Ranked Candidates</h3>
                  {sortedApplicants.filter((a: any) => a.match_score).map((app: any, idx: number) => (
                    <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${idx === 0 ? "bg-accent text-accent-foreground" : idx === 1 ? "bg-muted text-foreground" : idx === 2 ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"}`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{(app as any).profiles?.first_name} {(app as any).profiles?.last_name}</p>
                          <p className="text-sm text-muted-foreground">{app.jobs?.title} • {(app as any).profiles?.university_name || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{app.match_score}%</p>
                          <p className="text-xs text-muted-foreground">AI Score</p>
                        </div>
                        <Badge className={app.status === "shortlisted" ? "bg-primary/20 text-primary" : ""}>{app.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="py-4">
              {notifications.length === 0 ? <p className="text-center text-muted-foreground py-4">No notifications</p> : (
                <div className="space-y-2">
                  {notifications.map((n: any) => (
                    <div key={n.id} className={`rounded-lg border p-3 ${n.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`}>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerDashboard;
