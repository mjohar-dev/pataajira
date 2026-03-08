import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, Building2, Briefcase, BarChart3, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { useMemo } from "react";

const CHART_COLORS = ["hsl(145, 63%, 32%)", "hsl(30, 80%, 52%)", "hsl(0, 72%, 47%)", "hsl(220, 20%, 46%)", "hsl(200, 70%, 50%)"];

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: employers = [] } = useQuery({
    queryKey: ["admin-employers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*, employers(company_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["admin-applications-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("id, status, created_at").limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const verifyEmployer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employers").update({ is_verified: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-employers"] }); toast.success("Employer verified!"); },
  });

  const approveJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").update({ is_approved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }); toast.success("Job approved!"); },
  });

  const rejectJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }); toast.success("Job removed"); },
  });

  // Analytics data
  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u: any) => {
      const role = u.user_roles?.[0]?.role || "unknown";
      counts[role] = (counts[role] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [users]);

  const applicationStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a: any) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const signupTrend = useMemo(() => {
    const monthly: Record<string, number> = {};
    users.forEach((u: any) => {
      const month = new Date(u.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
      monthly[month] = (monthly[month] || 0) + 1;
    });
    return Object.entries(monthly).slice(-6).map(([month, count]) => ({ month, users: count }));
  }, [users]);

  const jobsByIndustry = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j: any) => {
      const ind = j.industry || "Other";
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [jobs]);

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, change: "+12%" },
    { label: "Employers", value: employers.length, icon: Building2, change: "+5%" },
    { label: "Jobs Posted", value: jobs.length, icon: Briefcase, change: "+18%" },
    { label: "Applications", value: applications.length, icon: BarChart3, change: "+24%" },
  ];

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management & analytics</p>
        </div>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
              <span className="text-xs font-medium text-primary flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{s.change}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics" className="gap-1"><Activity className="h-4 w-4" /> Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">User Signup Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={signupTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(145, 63%, 32%)" strokeWidth={2} dot={{ fill: "hsl(145, 63%, 32%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">User Roles</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {roleDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Application Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={applicationStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(145, 63%, 32%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Jobs by Industry</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={jobsByIndustry} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(30, 80%, 52%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{u.first_name} {u.last_name}</p>
                      <p className="text-sm text-muted-foreground">{u.university_name || "N/A"} • Joined {new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {u.user_roles?.map((r: any) => <Badge key={r.role} variant="outline">{r.role}</Badge>)}
                      <a href={`/profile/${u.user_id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">View</Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employers">
          <Card>
            <CardHeader><CardTitle>Employers</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {employers.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{e.company_name}</p>
                      <p className="text-sm text-muted-foreground">{e.industry} • {e.location}</p>
                    </div>
                    {e.is_verified ? (
                      <Badge className="bg-primary/20 text-primary">Verified</Badge>
                    ) : (
                      <Button size="sm" onClick={() => verifyEmployer.mutate(e.id)}>Verify</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader><CardTitle>All Jobs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobs.map((j: any) => (
                  <div key={j.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{j.title}</p>
                      <p className="text-sm text-muted-foreground">{j.employers?.company_name} • {j.type}</p>
                    </div>
                    <div className="flex gap-2">
                      {j.is_approved ? (
                        <Badge className="bg-primary/20 text-primary">Approved</Badge>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => approveJob.mutate(j.id)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectJob.mutate(j.id)}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
