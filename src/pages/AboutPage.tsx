import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Heart, Shield, Target, Users } from "lucide-react";

const values = [
  { icon: <Target className="h-6 w-6" />, title: "Graduate-First Focus", desc: "Every listing requires less than 2 years of experience. No misleading senior roles disguised as entry-level." },
  { icon: <Shield className="h-6 w-6" />, title: "Verified Employers", desc: "Every employer is vetted before posting. We protect graduates from scams and fake listings." },
  { icon: <Heart className="h-6 w-6" />, title: "AI-Powered Support", desc: "From resume optimization to interview practice, our AI tools help you put your best foot forward." },
  { icon: <Users className="h-6 w-6" />, title: "Community Driven", desc: "Built with input from Kenyan universities, career offices, and thousands of graduates." },
];

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <div className="bg-hero-gradient text-primary-foreground">
      <div className="container py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">About PataAjira Kenya</h1>
          <p className="mt-4 text-lg text-primary-foreground/70">
            We're on a mission to bridge the gap between Kenyan graduates and meaningful employment opportunities.
          </p>
        </motion.div>
      </div>
    </div>

    <div className="container py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-foreground">The Problem</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Kenya produces over 250,000 graduates annually, yet youth unemployment remains above 35%. Traditional job platforms overwhelm fresh graduates with roles requiring years of experience they don't have. Graduates struggle with unoptimized resumes, lack interview preparation, and have no clear pathway from university to employment.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-foreground">Our Solution</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            PataAjira is exclusively designed for early-career talent. We partner with employers committed to developing fresh graduates and provide AI-powered tools that level the playing field. Our platform ensures every graduate has access to professional resume optimization, interview coaching, and personalized job recommendations. We partner with employers committed to developing fresh graduates and provide AI-powered tools that level the playing field. Our platform ensures every graduate has access to professional resume optimization, interview coaching, and personalized job recommendations.
          </p>
        </motion.div>
      </div>
    </div>

    <div className="bg-muted/50 py-16">
      <div className="container">
        <h2 className="text-center font-display text-3xl font-bold text-foreground">Our Values</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{v.icon}</div>
              <h3 className="font-display font-semibold text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    <div className="container py-16 text-center">
      <div className="mx-auto max-w-lg">
        <GraduationCap className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 font-display text-3xl font-bold text-foreground">Join the Movement</h2>
        <p className="mt-3 text-muted-foreground">Whether you're a graduate looking for your first role or an employer seeking fresh talent, GradLink is for you.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/register"><Button size="lg">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          <Link to="/jobs"><Button variant="outline" size="lg">Browse Jobs</Button></Link>
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
