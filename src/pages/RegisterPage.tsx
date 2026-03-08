import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Eye, EyeOff, GraduationCap, Building2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
  <div className="flex items-center gap-1.5 text-xs">
    {met ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
    <span className={met ? "text-green-600" : "text-muted-foreground"}>{label}</span>
  </div>
);

const RegisterPage = () => {
  const [role, setRole] = useState<"student" | "employer">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [university, setUniversity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const passwordStrength = useMemo(() => {
    const score = Object.values(passwordChecks).filter(Boolean).length;
    if (score <= 1) return { label: "Weak", color: "bg-destructive", width: "w-1/5" };
    if (score <= 2) return { label: "Fair", color: "bg-orange-500", width: "w-2/5" };
    if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "w-3/5" };
    if (score <= 4) return { label: "Strong", color: "bg-green-400", width: "w-4/5" };
    return { label: "Excellent", color: "bg-green-600", width: "w-full" };
  }, [passwordChecks]);

  const allChecksPassed = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecksPassed) {
      toast.error("Please meet all password requirements");
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        role,
      });
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start your career journey with PataAjira</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button type="button" onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${role === "student" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <GraduationCap className="h-4 w-4" /> Graduate
            </button>
            <button type="button" onClick={() => setRole("employer")}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${role === "employer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Building2 className="h-4 w-4" /> Employer
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="John" className="mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Ochieng" className="mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@university.ac.ke" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {role === "employer" && (
              <div>
                <Label htmlFor="company">Company name</Label>
                <Input id="company" placeholder="Your company" className="mt-1" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
            )}

            {role === "student" && (
              <div>
                <Label htmlFor="university">University</Label>
                <Input id="university" placeholder="University of Nairobi" className="mt-1" value={university} onChange={(e) => setUniversity(e.target.value)} />
              </div>
            )}

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <PasswordRequirement met={passwordChecks.minLength} label="8+ characters" />
                    <PasswordRequirement met={passwordChecks.hasUpper} label="Uppercase letter" />
                    <PasswordRequirement met={passwordChecks.hasLower} label="Lowercase letter" />
                    <PasswordRequirement met={passwordChecks.hasNumber} label="Number" />
                    <PasswordRequirement met={passwordChecks.hasSpecial} label="Special character" />
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full" size="lg" type="submit" disabled={isLoading || !allChecksPassed}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
