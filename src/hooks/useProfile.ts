import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { profile, isLoading, updateProfile };
};

export const useUserSkills = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userSkills = [], isLoading } = useQuery({
    queryKey: ["user-skills", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skills")
        .select("*, skills(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addSkill = useMutation({
    mutationFn: async ({ skillId, level }: { skillId: string; level: string }) => {
      const { error } = await supabase
        .from("user_skills")
        .insert({ user_id: user!.id, skill_id: skillId, proficiency_level: level });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", user?.id] });
      toast.success("Skill added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const removeSkill = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from("user_skills")
        .delete()
        .eq("user_id", user!.id)
        .eq("skill_id", skillId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", user?.id] });
      toast.success("Skill removed");
    },
  });

  return { userSkills, isLoading, addSkill, removeSkill };
};

export const useAllSkills = () => {
  return useQuery({
    queryKey: ["all-skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
};
