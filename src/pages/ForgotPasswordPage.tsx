import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent to your email");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
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
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card text-center space-y-4">
            <Mail className="h-12 w-12 mx-auto text-primary" />
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>. 
              Check your inbox and follow the instructions.
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="w-full">
              Send again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email" type="email" placeholder="you@university.ac.ke" className="mt-1"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
            <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
