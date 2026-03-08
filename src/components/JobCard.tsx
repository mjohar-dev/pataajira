import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Bookmark } from "lucide-react";
import type { Job } from "@/lib/mock-data";
import { useSavedJobs } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  internship: "bg-primary/10 text-primary border-primary/20",
  trainee: "bg-accent/10 text-accent border-accent/20",
  "entry-level": "bg-secondary/10 text-secondary border-secondary/20",
};

const typeLabels: Record<string, string> = {
  internship: "Internship",
  trainee: "Graduate Trainee",
  "entry-level": "Entry Level",
};

const JobCard = ({ job }: { job: Job }) => {
  const { user } = useAuth();
  const { toggleSave, isJobSaved } = useSavedJobs();
  const saved = isJobSaved(job.id);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to save jobs");
      return;
    }
    toggleSave.mutate(job.id, {
      onSuccess: () => toast.success(saved ? "Job unsaved" : "Job saved!"),
      onError: (error: any) => toast.error(error?.message || "Failed to save job"),
    });
  };

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-lg font-bold text-primary">
            {job.companyLogo}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`shrink-0 p-1 transition-colors ${saved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
        <Badge variant="outline" className={`text-xs ${typeColors[job.type]}`}>
          {typeLabels[job.type]}
        </Badge>
        {job.remote && <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">Remote</Badge>}
        {job.salary && <span className="font-medium text-foreground">{job.salary}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Deadline: {new Date(job.deadline).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.applicants} applicants</span>
      </div>
    </Link>
  );
};

export default JobCard;
