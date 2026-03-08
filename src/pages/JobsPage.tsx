import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import JobCard from "@/components/JobCard";
import { MOCK_JOBS, LOCATIONS, INDUSTRIES } from "@/lib/mock-data";
import type { Job } from "@/lib/mock-data";
import { useJobs } from "@/hooks/useJobs";

const JOB_TYPES = [
  { value: "all", label: "All Types" },
  { value: "internship", label: "Internship" },
  { value: "trainee", label: "Graduate Trainee" },
  { value: "entry-level", label: "Entry Level" },
];

const mapDbJobToMock = (dbJob: any): Job => ({
  id: dbJob.id,
  title: dbJob.title,
  company: dbJob.employers?.company_name || "Unknown",
  companyLogo: (dbJob.employers?.company_name || "?")[0],
  location: dbJob.location || dbJob.employers?.location || "Remote",
  type: dbJob.type || "entry-level",
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
});

const JobsPage = () => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: dbJobs, isLoading } = useJobs({
    type: type !== "all" ? type : undefined,
    industry: industry !== "all" ? industry : undefined,
    location: location !== "all" ? location : undefined,
    search: search || undefined,
  });

  const allJobs = useMemo(() => {
    const liveJobs = (dbJobs || []).map(mapDbJobToMock);
    return liveJobs.length > 0 ? liveJobs : MOCK_JOBS;
  }, [dbJobs]);

  const filtered = useMemo(() => {
    return allJobs.filter((job) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.skills.some(s => s.toLowerCase().includes(q));
      const matchesLocation = location === "all" || job.location === location;
      const matchesType = type === "all" || job.type === type;
      const matchesIndustry = industry === "all" || job.industry === industry;
      const matchesRemote = !remoteOnly || job.remote;
      return matchesSearch && matchesLocation && matchesType && matchesIndustry && matchesRemote;
    });
  }, [search, location, type, industry, remoteOnly, allJobs]);

  const activeFilters = [location !== "all", type !== "all", industry !== "all", remoteOnly].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setLocation("all");
    setType("all");
    setIndustry("all");
    setRemoteOnly(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-hero-gradient text-primary-foreground">
        <div className="container py-12 md:py-16">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Find Your Opportunity</h1>
          <p className="mt-2 text-primary-foreground/70">Browse internships, trainee programs, and entry-level jobs across Kenya</p>

          <div className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-10 bg-background/95 text-foreground border-0 shadow-lg"
              />
            </div>
            <Button
              variant="hero-outline"
              size="lg"
              className="shrink-0 lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilters > 0 && <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-accent text-accent-foreground">{activeFilters}</Badge>}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className={`shrink-0 space-y-5 ${showFilters ? "block" : "hidden"} lg:block w-full lg:w-60`}>
            <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">Filters</h3>
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Job Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Industry</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground">Remote only</span>
              </label>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> jobs found
              </p>
              {activeFilters > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {type !== "all" && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      {JOB_TYPES.find(t => t.value === type)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setType("all")} />
                    </Badge>
                  )}
                  {location !== "all" && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      {location}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setLocation("all")} />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground">No jobs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
