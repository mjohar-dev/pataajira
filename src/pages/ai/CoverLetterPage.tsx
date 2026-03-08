import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const CoverLetterPage = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription) { toast.error("Please provide a job description"); return; }
    setLoading(true);
    setResult("");
    try {
      const response = await supabase.functions.invoke("ai-tools", {
        body: { type: "cover-letter", resumeText, jobDescription },
      });
      if (response.error) throw response.error;
      setResult(response.data.content);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Cover Letter Generator</h1>
          <p className="text-muted-foreground">Generate a tailored cover letter</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Your Background (optional)</CardTitle></CardHeader>
          <CardContent><Textarea placeholder="Paste your resume or key achievements..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} /></CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
          <CardContent><Textarea placeholder="Paste the job description..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={10} /></CardContent>
        </Card>
      </div>

      <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Cover Letter</>}
      </Button>

      {result && (
        <Card><CardHeader><CardTitle>Your Cover Letter</CardTitle></CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{result}</ReactMarkdown></CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoverLetterPage;
