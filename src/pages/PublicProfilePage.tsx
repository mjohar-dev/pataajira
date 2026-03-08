import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MapPin, GraduationCap, Github, Linkedin, Globe, Calendar,
  Code2, ExternalLink, Briefcase, Mail, Phone, Target,
  FileText, Award, TrendingUp, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const proficiencyPercent: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();

  const handleResumeDownload = async (path: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate resume link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["public-skills", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skills")
        .select("*, skills(name, category)")
        .eq("user_id", userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["public-projects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: applicationCount = 0 } = useQuery({
    queryKey: ["public-app-count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!userId,
  });

  const { data: resumeAnalysisCount = 0 } = useQuery({
    queryKey: ["public-resume-count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("resume_analysis")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground mt-2">This developer profile doesn't exist.</p>
        <Link to="/"><Button className="mt-4">Go Home</Button></Link>
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Developer";

  const skillsByCategory = skills.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.skills?.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const stats = [
    { icon: <Code2 className="h-5 w-5" />, value: skills.length, label: "Skills" },
    { icon: <Briefcase className="h-5 w-5" />, value: projects.length, label: "Projects" },
    { icon: <FileText className="h-5 w-5" />, value: applicationCount, label: "Applications" },
    { icon: <TrendingUp className="h-5 w-5" />, value: resumeAnalysisCount, label: "AI Analyses" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-hero-gradient text-primary-foreground">
        <div className="container py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            <Avatar className="h-28 w-28 border-4 border-primary-foreground/20 shadow-lg">
              <AvatarFallback className="text-3xl font-bold bg-primary-foreground/10 text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                {fullName}
              </h1>
              {profile.education && (
                <p className="mt-1 text-lg text-primary-foreground/80 font-medium">{profile.education}</p>
              )}
              {profile.bio && (
                <p className="mt-2 text-primary-foreground/60 max-w-xl leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-primary-foreground/60">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span>
                )}
                {profile.university_name && (
                  <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{profile.university_name}</span>
                )}
                {profile.graduation_year && (
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Class of {profile.graduation_year}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="hero-outline" size="sm"><Github className="h-4 w-4 mr-1.5" /> GitHub</Button>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="hero-outline" size="sm"><Linkedin className="h-4 w-4 mr-1.5" /> LinkedIn</Button>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="hero-outline" size="sm"><Globe className="h-4 w-4 mr-1.5" /> Portfolio</Button>
                  </a>
                )}
                {profile.resume_url && (
                  <Button variant="hero-outline" size="sm" onClick={() => handleResumeDownload(profile.resume_url!)}>
                    <FileText className="h-4 w-4 mr-1.5" /> Resume
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {stat.icon}
                </div>
                <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            {Object.keys(skillsByCategory).length > 0 && (
              <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-primary" /> Skills & Proficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
                      <div key={cat}>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat}</p>
                        <div className="space-y-3">
                          {(catSkills as any[]).map((s: any) => {
                            const level = s.proficiency_level?.toLowerCase() || "beginner";
                            const pct = proficiencyPercent[level] || 25;
                            return (
                              <div key={s.id} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-foreground">{s.skills?.name}</span>
                                  <Badge variant="outline" className="text-xs capitalize">{s.proficiency_level || "Beginner"}</Badge>
                                </div>
                                <Progress value={pct} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
              <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" /> Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {projects.map((project: any) => (
                        <div
                          key={project.id}
                          className="group rounded-xl border border-border bg-muted/30 p-5 space-y-3 transition-all hover:shadow-elevated hover:-translate-y-0.5"
                        >
                          {project.image_url && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <img
                                src={project.image_url}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-start justify-between">
                            <h3 className="font-display font-semibold text-foreground">{project.title}</h3>
                            {project.project_url && (
                              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                              </a>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                          )}
                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {project.technologies.map((t: string) => (
                                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Education & Details */}
            <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> About
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.education && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Education</p>
                        <p className="text-sm text-muted-foreground">{profile.education}</p>
                      </div>
                    </div>
                  )}
                  {profile.university_name && (
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">University</p>
                        <p className="text-sm text-muted-foreground">{profile.university_name}</p>
                      </div>
                    </div>
                  )}
                  {profile.graduation_year && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Graduation Year</p>
                        <p className="text-sm text-muted-foreground">{profile.graduation_year}</p>
                      </div>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Location</p>
                        <p className="text-sm text-muted-foreground">{profile.location}</p>
                      </div>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone</p>
                        <p className="text-sm text-muted-foreground">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Career Interests */}
            {profile.career_interests && profile.career_interests.length > 0 && (
              <motion.div {...fadeUp} transition={{ delay: 0.45 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" /> Career Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.career_interests.map((interest: string) => (
                        <Badge key={interest} className="bg-primary/10 text-primary border-primary/20">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Links */}
            <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" /> Connect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Github className="h-4 w-4" /> GitHub Profile
                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Linkedin className="h-4 w-4" /> LinkedIn Profile
                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Globe className="h-4 w-4" /> Portfolio Website
                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                    </a>
                  )}
                  {profile.resume_url && (
                    <button onClick={() => handleResumeDownload(profile.resume_url!)}
                      className="flex items-center gap-3 rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
                      <FileText className="h-4 w-4" /> Download Resume
                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                    </button>
                  )}
                  {!profile.github_url && !profile.linkedin_url && !profile.portfolio_url && !profile.resume_url && (
                    <p className="text-sm text-muted-foreground text-center py-2">No links added yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
