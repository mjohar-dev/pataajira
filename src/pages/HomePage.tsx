import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { STATS } from "@/lib/mock-data";
import { ArrowRight, Briefcase, Building2, GraduationCap, Search, Sparkles, Users } from "lucide-react";
import JobCard from "@/components/JobCard";
import { MOCK_JOBS } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  briefcase: <Briefcase className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  building: <Building2 className="h-6 w-6" />,
  graduation: <GraduationCap className="h-6 w-6" />,
};

const features = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Smart Job Matching",
    description: "AI-powered recommendations tailored to your skills, degree, and career goals.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI Resume Optimizer",
    description: "Get your resume scored and tailored for each application with ATS-friendly suggestions.",
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Graduate-First",
    description: "Every listing is for entry-level talent. No '5 years experience' for junior roles here.",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Top Kenyan Employers",
    description: "Connect with Safaricom, Equity, KCB, and 350+ companies actively hiring graduates.",
  },
];

const HeroSection = () => (
  <section className="relative overflow-hidden bg-hero-gradient text-primary-foreground">
    {/* Decorative pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
    </div>

    <div className="container relative py-20 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>AI-Powered Career Platform for Kenya</span>
        </div>

        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Your First Career
          <br />
          <span className="text-accent">Starts Here</span>
        </h1>

        <p className="mt-5 max-w-lg text-lg text-primary-foreground/70">
          GradLink connects fresh graduates and final-year students with internships, graduate trainee programs, and entry-level jobs across Kenya.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/jobs">
            <Button variant="hero" size="xl" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Find Jobs <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="hero-outline" size="xl">
              Create Profile
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

const StatsSection = () => (
  <section className="border-b border-border bg-card">
    <div className="container py-10">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {iconMap[stat.icon]}
            </div>
            <span className="font-display text-2xl font-bold text-foreground md:text-3xl">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-20">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Built for <span className="text-primary">Kenyan Graduates</span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Everything you need to launch your career, from AI-optimized resumes to interview preparation.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {feature.icon}
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedJobsSection = () => (
  <section className="bg-muted/50 py-20">
    <div className="container">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Latest Opportunities</h2>
          <p className="mt-2 text-muted-foreground">Fresh jobs posted by top Kenyan companies</p>
        </div>
        <Link to="/jobs" className="hidden md:block">
          <Button variant="outline">
            View All Jobs <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_JOBS.slice(0, 3).map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <Link to="/jobs" className="mt-6 flex justify-center md:hidden">
        <Button variant="outline" className="w-full">View All Jobs</Button>
      </Link>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-20">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-hero-gradient p-10 text-center text-primary-foreground md:p-16"
      >
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Ready to Launch Your Career?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
          Join thousands of Kenyan graduates already building their future with GradLink.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button variant="hero" size="xl" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Sign Up Free <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="hero-outline" size="xl">
              Post a Job
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

const HomePage = () => (
  <>
    <HeroSection />
    <StatsSection />
    <FeaturesSection />
    <FeaturedJobsSection />
    <CTASection />
  </>
);

export default HomePage;
