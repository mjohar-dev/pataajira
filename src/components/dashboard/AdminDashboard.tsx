import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, Building2, Briefcase, BarChart3 } from "lucide-react";

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
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("id").limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const verifyEmployer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employers").update({ is_verified: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-employers"] });
      toast.success("Employer verified!");
    },
  });

  const approveJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").update({ is_approved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Job approved!");
    },
  });

  const rejectJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Job removed");
    },
  });

  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Employers", value: employers.length, icon: Building2 },
    { label: "Jobs Posted", value: jobs.length, icon: Briefcase },
    { label: "Applications", value: applications.length, icon: BarChart3 },
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
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{u.first_name} {u.last_name}</p>
                      <p className="text-sm text-muted-foreground">{u.university_name || "N/A"}</p>
                    </div>
                    <div className="flex gap-2">
                      {u.user_roles?.map((r: any) => <Badge key={r.role} variant="outline">{r.role}</Badge>)}
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
