import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, GraduationCap, Github, Linkedin, Globe, Calendar, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();

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

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
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
  const skillsByCategory = skills.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.skills?.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-hero-gradient text-primary-foreground">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary-foreground/20">
              <AvatarFallback className="text-2xl bg-primary-foreground/10 text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-extrabold">{profile.first_name} {profile.last_name}</h1>
              {profile.bio && <p className="mt-2 text-primary-foreground/70 max-w-xl">{profile.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-primary-foreground/60">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span>}
                {profile.university_name && <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{profile.university_name}</span>}
                {profile.graduation_year && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Class of {profile.graduation_year}</span>}
              </div>
              <div className="flex gap-3 mt-4">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="hero-outline" size="sm"><Github className="h-4 w-4 mr-1" /> GitHub</Button>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="hero-outline" size="sm"><Linkedin className="h-4 w-4 mr-1" /> LinkedIn</Button>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="hero-outline" size="sm"><Globe className="h-4 w-4 mr-1" /> Portfolio</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {Object.keys(skillsByCategory).length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-primary" /> Skills</CardTitle></CardHeader>
            <CardContent>
              {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
                <div key={cat} className="mb-4 last:mb-0">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {(catSkills as any[]).map((s: any) => (
                      <Badge key={s.id} variant="secondary" className="gap-1">
                        {s.skills?.name}
                        <span className="text-xs opacity-60">• {s.proficiency_level}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {projects.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project: any) => (
                  <div key={project.id} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-display font-semibold">{project.title}</h3>
                      {project.project_url && (
                        <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                    {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
