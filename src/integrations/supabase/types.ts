export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          employer_notes: string | null
          employer_rank: number | null
          id: string
          job_id: string
          match_score: number | null
          resume_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          employer_notes?: string | null
          employer_rank?: number | null
          id?: string
          job_id: string
          match_score?: number | null
          resume_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          employer_notes?: string | null
          employer_rank?: number | null
          id?: string
          job_id?: string
          match_score?: number | null
          resume_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          company_description: string | null
          company_logo_url: string | null
          company_name: string
          company_size: string | null
          created_at: string
          id: string
          industry: string | null
          is_verified: boolean | null
          location: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_description?: string | null
          company_logo_url?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          location?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          location?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      external_jobs: {
        Row: {
          apply_url: string | null
          company: string
          company_logo: string | null
          deadline: string | null
          description: string | null
          fetched_at: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          location: string | null
          posted_date: string | null
          remote: boolean | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary: string | null
          skills: string[] | null
          source: string
          source_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          apply_url?: string | null
          company: string
          company_logo?: string | null
          deadline?: string | null
          description?: string | null
          fetched_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          location?: string | null
          posted_date?: string | null
          remote?: boolean | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary?: string | null
          skills?: string[] | null
          source: string
          source_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          apply_url?: string | null
          company?: string
          company_logo?: string | null
          deadline?: string | null
          description?: string | null
          fetched_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          location?: string | null
          posted_date?: string | null
          remote?: boolean | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary?: string | null
          skills?: string[] | null
          source?: string
          source_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          applicant_count: number | null
          created_at: string
          deadline: string | null
          description: string
          employer_id: string
          id: string
          industry: string | null
          is_active: boolean | null
          is_approved: boolean | null
          location: string | null
          posted_date: string
          remote: boolean | null
          required_skills: string[] | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary_range: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          applicant_count?: number | null
          created_at?: string
          deadline?: string | null
          description: string
          employer_id: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          location?: string | null
          posted_date?: string
          remote?: boolean | null
          required_skills?: string[] | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_range?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          applicant_count?: number | null
          created_at?: string
          deadline?: string | null
          description?: string
          employer_id?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          location?: string | null
          posted_date?: string
          remote?: boolean | null
          required_skills?: string[] | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_range?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career_interests: string[] | null
          created_at: string
          education: string | null
          first_name: string | null
          github_url: string | null
          graduation_year: number | null
          id: string
          is_approved: boolean | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          resume_url: string | null
          university_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career_interests?: string[] | null
          created_at?: string
          education?: string | null
          first_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          is_approved?: boolean | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          university_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career_interests?: string[] | null
          created_at?: string
          education?: string | null
          first_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          is_approved?: boolean | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          university_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          project_url: string | null
          technologies: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string | null
        }
        Relationships: []
      }
      resume_analysis: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          improvements: string[] | null
          job_id: string | null
          match_score: number | null
          optimized_content: string | null
          resume_url: string | null
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          improvements?: string[] | null
          job_id?: string | null
          match_score?: number | null
          optimized_content?: string | null
          resume_url?: string | null
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          improvements?: string[] | null
          job_id?: string | null
          match_score?: number | null
          optimized_content?: string | null
          resume_url?: string | null
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_analysis_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessments: {
        Row: {
          created_at: string
          current_level: string | null
          gap_analysis: string | null
          id: string
          recommended_resources: string[] | null
          skill_name: string
          target_level: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: string | null
          gap_analysis?: string | null
          id?: string
          recommended_resources?: string[] | null
          skill_name: string
          target_level?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: string | null
          gap_analysis?: string | null
          id?: string
          recommended_resources?: string[] | null
          skill_name?: string
          target_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          created_at: string
          id: string
          location: string | null
          logo_url: string | null
          name: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          proficiency_level: string | null
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency_level?: string | null
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proficiency_level?: string | null
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "employer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "employer", "admin"],
    },
  },
} as const
