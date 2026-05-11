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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          birth_month: number | null
          birth_year: number | null
          country_code: string | null
          created_at: string
          current_streak: number
          display_name: string
          grade: number | null
          id: string
          last_active_at: string | null
          level: number
          locale: string
          longest_streak: number
          onboarding_completed: boolean
          parent_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          terms_accepted_at: string | null
          updated_at: string
          username: string | null
          xp_total: number
        }
        Insert: {
          avatar_url?: string | null
          birth_month?: number | null
          birth_year?: number | null
          country_code?: string | null
          created_at?: string
          current_streak?: number
          display_name: string
          grade?: number | null
          id: string
          last_active_at?: string | null
          level?: number
          locale?: string
          longest_streak?: number
          onboarding_completed?: boolean
          parent_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          xp_total?: number
        }
        Update: {
          avatar_url?: string | null
          birth_month?: number | null
          birth_year?: number | null
          country_code?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string
          grade?: number | null
          id?: string
          last_active_at?: string | null
          level?: number
          locale?: string
          longest_streak?: number
          onboarding_completed?: boolean
          parent_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          xp_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          city: string | null
          country_code: string
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          city?: string | null
          country_code: string
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          city?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      team_members: {
        Row: {
          joined_at: string
          student_id: string
          team_id: string
        }
        Insert: {
          joined_at?: string
          student_id: string
          team_id: string
        }
        Update: {
          joined_at?: string
          student_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          coach_id: string
          created_at: string
          division: Database["public"]["Enums"]["school_division"]
          id: string
          invite_code: string
          invite_enabled: boolean
          max_members: number
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          division: Database["public"]["Enums"]["school_division"]
          id?: string
          invite_code: string
          invite_enabled?: boolean
          max_members?: number
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          division?: Database["public"]["Enums"]["school_division"]
          id?: string
          invite_code?: string
          invite_enabled?: boolean
          max_members?: number
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_onboarding: {
        Args: {
          p_country_code?: string
          p_grade?: number
          p_school_id?: string
          p_username?: string
        }
        Returns: {
          avatar_url: string | null
          birth_month: number | null
          birth_year: number | null
          country_code: string | null
          created_at: string
          current_streak: number
          display_name: string
          grade: number | null
          id: string
          last_active_at: string | null
          level: number
          locale: string
          longest_streak: number
          onboarding_completed: boolean
          parent_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          terms_accepted_at: string | null
          updated_at: string
          username: string | null
          xp_total: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_team_invite_code: { Args: never; Returns: string }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string | null
          birth_month: number | null
          birth_year: number | null
          country_code: string | null
          created_at: string
          current_streak: number
          display_name: string
          grade: number | null
          id: string
          last_active_at: string | null
          level: number
          locale: string
          longest_streak: number
          onboarding_completed: boolean
          parent_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          terms_accepted_at: string | null
          updated_at: string
          username: string | null
          xp_total: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_teacher: { Args: never; Returns: boolean }
      join_team: {
        Args: { p_invite_code: string }
        Returns: {
          coach_id: string
          created_at: string
          division: Database["public"]["Enums"]["school_division"]
          id: string
          invite_code: string
          invite_enabled: boolean
          max_members: number
          name: string
          school_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "teams"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      school_division: "elementary" | "middle"
      user_role: "student" | "parent" | "teacher" | "admin"
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
      school_division: ["elementary", "middle"],
      user_role: ["student", "parent", "teacher", "admin"],
    },
  },
} as const
