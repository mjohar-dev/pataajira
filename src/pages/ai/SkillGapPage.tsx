import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserSkills } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const SkillGapPage = () => {
  const { userSkills } = useUserSkills();
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!targetRole) { toast.error("Please enter a target role"); return; }
    setLoading(true);
    setResult("");
    const skills = userSkills.map((us: any) => `${us.skills?.name} (${us.proficiency_level})`).join(", ");
    try {
      const response = await supabase.functions.invoke("ai-tools", {
        body: { type: "skill-gap", currentSkills: skills, targetRole },
      });
      if (response.error) throw response.error;
      setResult(response.data.content);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze skills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Skill Gap Analyzer</h1>
          <p className="text-muted-foreground">Discover what skills you need for your dream role</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Your Current Skills</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {userSkills.length > 0 ? userSkills.map((us: any) => (
              <span key={us.id} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{us.skills?.name}</span>
            )) : <p className="text-muted-foreground text-sm">Add skills in your dashboard first for better analysis</p>}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Target role (e.g., Software Engineer)" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-1" /> Analyze</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card><CardHeader><CardTitle>Gap Analysis</CardTitle></CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{result}</ReactMarkdown></CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillGapPage;
