import { useParams, Link } from "react-router-dom";
import { MOCK_JOBS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark, Building2, Calendar, Clock, ExternalLink, Globe, Loader2, MapPin, Share2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useJob } from "@/hooks/useJobs";

const typeLabels: Record<string, string> = {
  internship: "Internship",
  trainee: "Graduate Trainee",
  "entry-level": "Entry Level",
};

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dbJob, isLoading } = useJob(id || "");

  // Fall back to mock data if no DB job found
  const mockJob = MOCK_JOBS.find((j) => j.id === id);

  // Map DB job to display format
  const job = dbJob
    ? {
        id: dbJob.id,
        title: dbJob.title,
        company: dbJob.employers?.company_name || "Unknown",
        companyLogo: dbJob.employers?.company_logo_url || (dbJob.employers?.company_name || "?")[0],
        companyDescription: dbJob.employers?.company_description || null,
        companyWebsite: dbJob.employers?.website || null,
        companyLocation: dbJob.employers?.location || null,
        location: dbJob.location || dbJob.employers?.location || "Remote",
        type: (dbJob.type || "entry-level") as string,
        industry: dbJob.industry || "Other",
        skills: dbJob.required_skills || [],
        salary: dbJob.salary_range || undefined,
        description: dbJob.description,
        requirements: dbJob.requirements || [],
        responsibilities: dbJob.responsibilities || [],
        deadline: dbJob.deadline || "",
        postedDate: dbJob.posted_date,
        remote: dbJob.remote || false,
        applicants: dbJob.applicant_count || 0,
        hasLogo: !!dbJob.employers?.company_logo_url,
      }
    : mockJob
    ? {
        ...mockJob,
        companyDescription: null as string | null,
        companyWebsite: null as string | null,
        companyLocation: mockJob.location,
        hasLogo: false,
      }
    : null;

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold">Job Not Found</h1>
        <p className="mt-2 text-muted-foreground">This job listing may have been removed.</p>
        <Link to="/jobs"><Button className="mt-6">Browse Jobs</Button></Link>
      </div>
    );
  }

  const logoIsUrl = job.hasLogo && job.companyLogo.startsWith("http");

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
                {logoIsUrl ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="h-16 w-16 shrink-0 rounded-xl object-contain bg-muted"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-2xl font-bold text-primary">
                    {typeof job.companyLogo === "string" ? job.companyLogo[0] : "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl font-bold text-foreground">{job.title}</h1>
                  <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                    <Badge variant="outline">{typeLabels[job.type] || job.type}</Badge>
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

              {job.requirements.length > 0 && (
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
              )}

              {job.responsibilities.length > 0 && (
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
              )}

              {job.skills.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Required Skills</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
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
                  <span className="font-medium text-foreground">{typeLabels[job.type] || job.type}</span>
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
                {job.deadline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Deadline</span>
                    <span className="font-medium text-foreground">{new Date(job.deadline).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}
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

            {/* Company info section - now shows real data */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
              <div className="flex items-center gap-3">
                {logoIsUrl ? (
                  <img src={job.companyLogo} alt={job.company} className="h-10 w-10 rounded-lg object-contain bg-muted" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">
                    {typeof job.companyLogo === "string" ? job.companyLogo[0] : "?"}
                  </div>
                )}
                <div>
                  <h3 className="font-display font-semibold text-foreground">{job.company}</h3>
                  {job.companyLocation && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.companyLocation}
                    </p>
                  )}
                </div>
              </div>

              {job.companyDescription ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{job.companyDescription}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Leading organization in the {job.industry} sector, committed to developing early-career talent in Kenya.
                </p>
              )}

              {job.companyWebsite && (
                <a
                  href={job.companyWebsite.startsWith("http") ? job.companyWebsite : `https://${job.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full mt-1">
                    <Globe className="h-3.5 w-3.5 mr-1" /> Visit Website
                  </Button>
                </a>
              )}
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
