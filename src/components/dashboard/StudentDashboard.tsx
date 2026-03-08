import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUserSkills, useAllSkills } from "@/hooks/useProfile";
import { useApplications, useSavedJobs, useNotifications } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Briefcase, BookOpen, Bell, Heart, FileText, Sparkles, Upload, Github, Clock, CheckCircle2, XCircle, Eye, Share2, ChevronsUpDown, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const StudentDashboard = () => {
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { userSkills, addSkill, removeSkill } = useUserSkills();
  const { data: allSkills = [] } = useAllSkills();
  const { applications } = useApplications();
  const { savedJobs } = useSavedJobs();
  const { notifications, markRead, unreadCount } = useNotifications();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedSkill, setSelectedSkill] = useState("");
  const [customSkillName, setCustomSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const handleEditProfile = () => {
    setFormData({
      first_name: profile?.first_name || "", last_name: profile?.last_name || "", bio: profile?.bio || "",
      location: profile?.location || "", phone: profile?.phone || "", university_name: profile?.university_name || "",
      graduation_year: profile?.graduation_year || "", linkedin_url: profile?.linkedin_url || "", github_url: profile?.github_url || "",
    });
    setEditMode(true);
  };

  const handleSaveProfile = () => { updateProfile.mutate(formData); setEditMode(false); };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF and DOCX files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be under 5MB");
      return;
    }

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user!.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("resumes").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); }
    else { updateProfile.mutate({ resume_url: path }); toast.success("Resume uploaded!"); }
    setUploading(false);
  };

  const handleAddSkill = () => {
    if (!selectedSkill) return;
    addSkill.mutate({ skillId: selectedSkill, level: skillLevel });
    setSelectedSkill("");
    setCustomSkillName("");
  };

  const handleAddCustomSkill = async () => {
    const name = customSkillName.trim();
    if (!name || name.length > 100) { toast.error("Enter a valid skill name (max 100 chars)"); return; }
    setCreatingSkill(true);
    try {
      const { data, error } = await supabase.from("skills").insert({ name, category: "Other" }).select().single();
      if (error) {
        if (error.code === "23505") { toast.error("This skill already exists — search for it!"); }
        else { toast.error(error.message); }
        return;
      }
      addSkill.mutate({ skillId: data.id, level: skillLevel });
      setCustomSkillName("");
      setSelectedSkill("");
      // refresh skills list
      queryClient.invalidateQueries({ queryKey: ["all-skills"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingSkill(false);
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-muted text-muted-foreground", reviewing: "bg-accent/20 text-accent-foreground",
      shortlisted: "bg-primary/20 text-primary", interview: "bg-primary/30 text-primary",
      offered: "bg-primary text-primary-foreground", rejected: "bg-destructive/20 text-destructive",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const statusIcon = (status: string) => {
    if (status === "offered") return <CheckCircle2 className="h-4 w-4" />;
    if (status === "rejected") return <XCircle className="h-4 w-4" />;
    if (status === "interview") return <Eye className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const appStats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a: any) => a.status === "pending").length;
    const active = applications.filter((a: any) => ["reviewing", "shortlisted", "interview"].includes(a.status)).length;
    const offered = applications.filter((a: any) => a.status === "offered").length;
    const rejected = applications.filter((a: any) => a.status === "rejected").length;
    return { total, pending, active, offered, rejected };
  }, [applications]);

  const filteredApps = statusFilter === "all" ? applications : applications.filter((a: any) => a.status === statusFilter);

  if (profileLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {profile?.first_name || "Student"}</h1>
          <p className="text-muted-foreground">Manage your career journey</p>
        </div>
        <div className="flex gap-2">
          {user && (
            <Link to={`/profile/${user.id}`}>
              <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-1" /> Public Profile</Button>
            </Link>
          )}
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="profile" className="gap-1"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="skills" className="gap-1"><BookOpen className="h-4 w-4" /> Skills</TabsTrigger>
          <TabsTrigger value="applications" className="gap-1"><Briefcase className="h-4 w-4" /> Tracker</TabsTrigger>
          <TabsTrigger value="saved" className="gap-1"><Heart className="h-4 w-4" /> Saved</TabsTrigger>
          <TabsTrigger value="ai-tools" className="gap-1"><Sparkles className="h-4 w-4" /> AI Tools</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1 relative">
            <Bell className="h-4 w-4" /> Alerts
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">{unreadCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              {editMode ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveProfile}>Save</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEditProfile}>Edit Profile</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>First Name</Label><Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} /></div>
                  <div><Label>Last Name</Label><Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                  <div><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
                  <div><Label>University</Label><Input value={formData.university_name} onChange={(e) => setFormData({ ...formData, university_name: e.target.value })} /></div>
                  <div><Label>Graduation Year</Label><Input type="number" value={formData.graduation_year} onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) || null })} /></div>
                  <div><Label>LinkedIn</Label><Input value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} /></div>
                  <div><Label>GitHub</Label><Input value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Bio</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} /></div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{profile?.first_name} {profile?.last_name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{user?.email}</p></div>
                  <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{profile?.location || "Not set"}</p></div>
                  <div><p className="text-sm text-muted-foreground">University</p><p className="font-medium">{profile?.university_name || "Not set"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Graduation Year</p><p className="font-medium">{profile?.graduation_year || "Not set"}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Bio</p><p className="font-medium">{profile?.bio || "No bio yet"}</p></div>
                </div>
              )}
              <div className="border-t border-border pt-4">
                <Label className="flex items-center gap-2 mb-2"><Upload className="h-4 w-4" /> Resume</Label>
                {profile?.resume_url && <p className="text-sm text-primary mb-2">✓ Resume uploaded</p>}
                <Input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} disabled={uploading} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader><CardTitle>Your Skills</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {userSkills.map((us: any) => (
                  <Badge key={us.id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeSkill.mutate(us.skill_id)}>
                    {us.skills?.name} • {us.proficiency_level} ✕
                  </Badge>
                ))}
                {userSkills.length === 0 && <p className="text-muted-foreground text-sm">No skills added yet</p>}
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Add Skill</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {selectedSkill
                          ? allSkills.find((s: any) => s.id === selectedSkill)?.name
                          : "Search & select skill..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={true}>
                        <CommandInput placeholder="Search or type a new skill..." value={customSkillName} onValueChange={setCustomSkillName} />
                        <CommandEmpty>
                          <div className="p-2 text-center">
                            <p className="text-sm text-muted-foreground mb-2">"{customSkillName}" not found</p>
                            <Button size="sm" onClick={handleAddCustomSkill} disabled={creatingSkill || !customSkillName.trim()}>
                              {creatingSkill ? "Adding..." : `Add "${customSkillName.trim()}" as new skill`}
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandList className="max-h-[250px]">
                          {Object.entries(
                            allSkills
                              .filter((s: any) => !userSkills.some((us: any) => us.skill_id === s.id))
                              .reduce((acc: Record<string, any[]>, s: any) => {
                                const cat = s.category || "Other";
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(s);
                                return acc;
                              }, {})
                          )
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([category, skills]) => (
                              <CommandGroup key={category} heading={category}>
                                {(skills as any[]).map((s: any) => (
                                  <CommandItem
                                    key={s.id}
                                    value={s.name}
                                    onSelect={() => setSelectedSkill(s.id)}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", selectedSkill === s.id ? "opacity-100" : "opacity-0")} />
                                    {s.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={skillLevel} onValueChange={setSkillLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddSkill} disabled={!selectedSkill}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
              <Card className="cursor-pointer" onClick={() => setStatusFilter("all")}>
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold">{appStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer" onClick={() => setStatusFilter("pending")}>
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{appStats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer" onClick={() => setStatusFilter("reviewing")}>
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold text-accent">{appStats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer" onClick={() => setStatusFilter("offered")}>
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold text-primary">{appStats.offered}</p>
                  <p className="text-xs text-muted-foreground">Offered</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer" onClick={() => setStatusFilter("rejected")}>
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold text-destructive">{appStats.rejected}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </CardContent>
              </Card>
            </div>

            {appStats.total > 0 && (
              <Progress value={(appStats.offered / Math.max(appStats.total, 1)) * 100} className="h-2" />
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Application Tracker ({filteredApps.length})</CardTitle>
                {statusFilter !== "all" && <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")}>Clear filter</Button>}
              </CardHeader>
              <CardContent>
                {filteredApps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{applications.length === 0 ? "No applications yet." : "No applications with this status."}</p>
                    {applications.length === 0 && <Link to="/jobs"><Button className="mt-2" variant="outline">Browse Jobs</Button></Link>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApps.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${statusColor(app.status)}`}>
                            {statusIcon(app.status)}
                          </div>
                          <div>
                            <p className="font-medium">{app.jobs?.title}</p>
                            <p className="text-sm text-muted-foreground">{app.jobs?.employers?.company_name} • Applied {new Date(app.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.match_score && <span className="text-sm font-medium text-primary">{app.match_score}%</span>}
                          <Badge className={statusColor(app.status)}>{app.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader><CardTitle>Saved Jobs ({savedJobs.length})</CardTitle></CardHeader>
            <CardContent>
              {savedJobs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No saved jobs yet</p>
              ) : (
                <div className="space-y-3">
                  {savedJobs.map((sj: any) => (
                    <Link key={sj.id} to={`/jobs/${sj.job_id}`} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{sj.jobs?.title}</p>
                        <p className="text-sm text-muted-foreground">{sj.jobs?.employers?.company_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Resume Optimizer</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Analyze your resume against job descriptions and get AI-powered improvement suggestions.</p>
                <Link to="/ai/resume"><Button className="mt-3" size="sm">Optimize Resume</Button></Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Cover Letter Generator</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Generate tailored cover letters for specific job applications.</p>
                <Link to="/ai/cover-letter"><Button className="mt-3" size="sm">Generate Letter</Button></Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Interview Practice</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Practice interviews with an AI chatbot and get real-time feedback.</p>
                <Link to="/ai/interview"><Button className="mt-3" size="sm">Start Practice</Button></Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Skill Gap Analyzer</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Discover which skills you need to land your dream job.</p>
                <Link to="/ai/skill-gap"><Button className="mt-3" size="sm">Analyze Skills</Button></Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader><CardTitle className="flex items-center gap-2"><Github className="h-5 w-5 text-primary" /> GitHub Analyzer</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Analyze your GitHub portfolio and get AI insights on your tech skills.</p>
                <Link to="/ai/github"><Button className="mt-3" size="sm">Analyze Portfolio</Button></Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No notifications</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n: any) => (
                    <div key={n.id} className={`rounded-lg border p-3 cursor-pointer ${n.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`} onClick={() => !n.is_read && markRead.mutate(n.id)}>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
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

export default StudentDashboard;
