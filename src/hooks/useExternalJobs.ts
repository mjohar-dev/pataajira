import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Job } from "@/lib/mock-data";

interface ExternalJob {
  id: string;
  source: string;
  source_id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string | null;
  type: string | null;
  industry: string | null;
  skills: string[] | null;
  salary: string | null;
  description: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  deadline: string | null;
  posted_date: string | null;
  remote: boolean | null;
  apply_url: string | null;
  fetched_at: string;
  is_active: boolean;
}

const mapExternalJobToJob = (extJob: ExternalJob): Job => ({
  id: extJob.id,
  title: extJob.title,
  company: extJob.company,
  companyLogo: extJob.company_logo || extJob.company[0] || "?",
  location: extJob.location || "Remote",
  type: (extJob.type as Job["type"]) || "entry-level",
  industry: extJob.industry || "Technology",
  skills: extJob.skills || [],
  salary: extJob.salary || undefined,
  description: extJob.description || "",
  requirements: extJob.requirements || [],
  responsibilities: extJob.responsibilities || [],
  deadline: extJob.deadline || "",
  postedDate: extJob.posted_date || new Date().toISOString(),
  remote: extJob.remote || false,
  applicants: 0,
});

export const useExternalJobs = () => {
  return useQuery({
    queryKey: ["external-jobs"],
    queryFn: async () => {
      // Use rpc or direct fetch to avoid type issues until types regenerate
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/external_jobs?is_active=eq.true&order=fetched_at.desc&limit=50`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.log("External jobs fetch error:", response.status);
        return [];
      }

      const data = (await response.json()) as ExternalJob[];
      return data.map(mapExternalJobToJob);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useFetchExternalJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-external-jobs");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-jobs"] });
    },
  });
};
