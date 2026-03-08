import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X, Bell, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useJobs";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const isHome = location.pathname === "/";
  const { unreadCount } = useNotifications();

  const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Find Jobs", href: "/jobs" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {!isHome && (
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="shrink-0 h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Pata<span className="text-primary">Ajira</span>
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} to={link.href}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${location.pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="relative">
                <Button variant="ghost" size="sm">Dashboard</Button>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">{unreadCount}</span>}
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-border bg-background md:hidden overflow-hidden">
            <div className="container flex flex-col gap-2 py-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${location.pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex-1"><Button variant="outline" className="w-full" onClick={() => setMobileOpen(false)}>Dashboard</Button></Link>
                    <Button variant="outline" className="flex-1" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" onClick={() => setMobileOpen(false)}>Sign In</Button></Link>
                    <Link to="/register" className="flex-1"><Button className="w-full" onClick={() => setMobileOpen(false)}>Get Started</Button></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
