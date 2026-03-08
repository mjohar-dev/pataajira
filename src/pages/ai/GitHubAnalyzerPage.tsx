import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Github, Loader2, Star, GitFork, Code2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ReactMarkdown from "react-markdown";

interface RepoData {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  topics: string[];
}

const GitHubAnalyzerPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [username, setUsername] = useState(profile?.github_url?.replace(/.*github\.com\//, "").replace(/\/$/, "") || "");
  const [repos, setRepos] = useState<RepoData[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingRepos, setFetchingRepos] = useState(false);

  const fetchRepos = async () => {
    if (!username.trim()) { toast.error("Enter a GitHub username"); return; }
    setFetchingRepos(true);
    setRepos([]);
    setAnalysis("");
    try {
      const res = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=30`);
      if (!res.ok) throw new Error("GitHub user not found");
      const data = await res.json();
      setRepos(data);
      toast.success(`Found ${data.length} repositories`);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch repos");
    } finally {
      setFetchingRepos(false);
    }
  };

  const analyzePortfolio = async () => {
    if (repos.length === 0) { toast.error("Fetch repos first"); return; }
    setLoading(true);
    setAnalysis("");
    const repoSummary = repos.map(r => `- ${r.name}: ${r.language || "N/A"}, ★${r.stargazers_count}, ${r.description || "No description"}, topics: ${r.topics?.join(", ") || "none"}`).join("\n");
    try {
      const response = await supabase.functions.invoke("ai-tools", {
        body: { type: "github-analyze", username, repoSummary },
      });
      if (response.error) throw response.error;
      setAnalysis(response.data.content);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="font-display text-2xl font-bold">GitHub Portfolio Analyzer</h1>
          <p className="text-muted-foreground">Analyze your GitHub profile for career insights</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="GitHub username" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchRepos()} />
            </div>
            <Button onClick={fetchRepos} disabled={fetchingRepos}>
              {fetchingRepos ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch Repos"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {repos.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Code2 className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{repos.length}</p><p className="text-sm text-muted-foreground">Repositories</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10"><Star className="h-5 w-5 text-accent" /></div>
              <div><p className="text-2xl font-bold">{totalStars}</p><p className="text-sm text-muted-foreground">Total Stars</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10"><Code2 className="h-5 w-5 text-secondary" /></div>
              <div><p className="text-2xl font-bold">{languages.length}</p><p className="text-sm text-muted-foreground">Languages</p></div>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tech Stack</CardTitle>
              <Button onClick={analyzePortfolio} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Github className="h-4 w-4 mr-1" />}
                AI Analysis
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {languages.map(lang => (
                  <Badge key={lang} variant="secondary">{lang}</Badge>
                ))}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {repos.slice(0, 10).map(repo => (
                  <a key={repo.name} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{repo.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{repo.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0 ml-3">
                      {repo.language && <Badge variant="outline" className="text-xs">{repo.language}</Badge>}
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stargazers_count}</span>
                      <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks_count}</span>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <Card>
              <CardHeader><CardTitle>AI Portfolio Analysis</CardTitle></CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default GitHubAnalyzerPage;
