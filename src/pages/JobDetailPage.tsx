import { useParams, Link } from "react-router-dom";
import { MOCK_JOBS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark, Calendar, Clock, ExternalLink, MapPin, Share2, Users } from "lucide-react";
import { motion } from "framer-motion";

const typeLabels: Record<string, string> = {
  internship: "Internship",
  trainee: "Graduate Trainee",
  "entry-level": "Entry Level",
};

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const job = MOCK_JOBS.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold">Job Not Found</h1>
        <p className="mt-2 text-muted-foreground">This job listing may have been removed.</p>
        <Link to="/jobs"><Button className="mt-6">Browse Jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-2xl font-bold text-primary">
                  {job.companyLogo}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl font-bold text-foreground">{job.title}</h1>
                  <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                    <Badge variant="outline">{typeLabels[job.type]}</Badge>
                    {job.remote && <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Remote</Badge>}
                    {job.salary && <span className="font-semibold text-foreground">{job.salary}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg">Apply Now</Button>
                </Link>
                <Button variant="outline" size="lg"><Bookmark className="h-4 w-4 mr-1" /> Save</Button>
                <Button variant="ghost" size="lg"><Share2 className="h-4 w-4 mr-1" /> Share</Button>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">About the Role</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{job.description}</p>
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Requirements</h2>
                <ul className="mt-2 space-y-2">
                  {job.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Responsibilities</h2>
                <ul className="mt-2 space-y-2">
                  {job.responsibilities.map((res) => (
                    <li key={res} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {res}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Required Skills</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-foreground">Job Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-foreground">{typeLabels[job.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium text-foreground">{job.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground">{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary</span>
                    <span className="font-medium text-foreground">{job.salary}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Deadline</span>
                  <span className="font-medium text-foreground">{new Date(job.deadline).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Applicants</span>
                  <span className="font-medium text-foreground">{job.applicants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Posted</span>
                  <span className="font-medium text-foreground">{new Date(job.postedDate).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold text-foreground">About {job.company}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Leading organization in the {job.industry} sector, committed to developing early-career talent in Kenya.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Company
              </Button>
            </div>

            <Link to="/register" className="block">
              <Button className="w-full" size="lg">Apply Now</Button>
            </Link>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
