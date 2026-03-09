import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useJobs = (filters?: { type?: string; industry?: string; location?: string; search?: string }) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select("*, employers(company_name, company_logo_url, location)")
        .eq("is_active", true)
        .eq("is_approved", true)
        .order("posted_date", { ascending: false });

      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.industry) query = query.eq("industry", filters.industry);
      if (filters?.location) query = query.eq("location", filters.location);
      if (filters?.search) {
        const sanitized = filters.search.replace(/[%_\\]/g, '\\$&');
        query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, employers(company_name, company_logo_url, company_description, website, location)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useSavedJobs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedJobs = [] } = useQuery({
    queryKey: ["saved-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("*, jobs(*, employers(company_name, company_logo_url))")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleSave = useMutation({
    mutationFn: async (jobId: string) => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId);
      if (!isUuid) {
        throw new Error("This is a sample listing. Real employer jobs can be saved!");
      }

      const existing = savedJobs.find((s: any) => s.job_id === jobId);
      if (existing) {
        const { error } = await supabase.from("saved_jobs").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_jobs").insert({ user_id: user!.id, job_id: jobId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs", user?.id] });
    },
  });

  const isJobSaved = (jobId: string) => savedJobs.some((s: any) => s.job_id === jobId);

  return { savedJobs, toggleSave, isJobSaved };
};

export const useApplications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(title, employers(company_name))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const apply = useMutation({
    mutationFn: async ({ jobId, resumeUrl, coverLetter }: { jobId: string; resumeUrl?: string; coverLetter?: string }) => {
      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        user_id: user!.id,
        resume_url: resumeUrl,
        cover_letter: coverLetter,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", user?.id] });
      toast.success("Application submitted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { applications, isLoading, apply };
};

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return { notifications, markRead, unreadCount };
};
