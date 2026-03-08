import { Link } from "react-router-dom";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-foreground text-background">
    <div className="container py-16">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              Grad<span className="text-primary">Link</span>
            </span>
          </div>
          <p className="text-sm text-background/60">
            Connecting Kenyan graduates with their first career opportunities through AI-powered tools.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-display font-semibold">For Graduates</h4>
          <ul className="space-y-2 text-sm text-background/60">
            <li><Link to="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Create Profile</Link></li>
            <li><span className="cursor-default">AI Resume Builder</span></li>
            <li><span className="cursor-default">Interview Practice</span></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display font-semibold">For Employers</h4>
          <ul className="space-y-2 text-sm text-background/60">
            <li><Link to="/register" className="hover:text-primary transition-colors">Post a Job</Link></li>
            <li><span className="cursor-default">Browse Talent</span></li>
            <li><span className="cursor-default">Pricing</span></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display font-semibold">Contact</h4>
          <ul className="space-y-3 text-sm text-background/60">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@gradlink.co.ke</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +254 700 000 000</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Nairobi, Kenya</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-background/10 pt-6 text-center text-sm text-background/40">
        © {new Date().getFullYear()} GradLink Kenya. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
