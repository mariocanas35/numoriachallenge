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
      contest_attempts: {
        Row: {
          contest_id: string
          id: string
          is_paper_entry: boolean
          max_possible_score: number
          session_id: string | null
          started_at: string
          student_id: string
          submitted_at: string | null
          time_spent_seconds: number | null
          total_correct: number
          total_score: number
        }
        Insert: {
          contest_id: string
          id?: string
          is_paper_entry?: boolean
          max_possible_score?: number
          session_id?: string | null
          started_at?: string
          student_id: string
          submitted_at?: string | null
          time_spent_seconds?: number | null
          total_correct?: number
          total_score?: number
        }
        Update: {
          contest_id?: string
          id?: string
          is_paper_entry?: boolean
          max_possible_score?: number
          session_id?: string | null
          started_at?: string
          student_id?: string
          submitted_at?: string | null
          time_spent_seconds?: number | null
          total_correct?: number
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "contest_attempts_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "contest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_problems: {
        Row: {
          contest_id: string
          position: number
          problem_id: string
        }
        Insert: {
          contest_id: string
          position: number
          problem_id: string
        }
        Update: {
          contest_id?: string
          position?: number
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_problems_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_problems_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_sessions: {
        Row: {
          closes_at: string
          contest_id: string
          created_at: string
          id: string
          notes: string | null
          opened_at: string
          opened_by: string
          status: Database["public"]["Enums"]["session_status"]
          team_id: string
          updated_at: string
        }
        Insert: {
          closes_at: string
          contest_id: string
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id: string
          updated_at?: string
        }
        Update: {
          closes_at?: string
          contest_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_sessions_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          calculator_allowed: boolean
          contest_number: number
          created_at: string
          division: Database["public"]["Enums"]["school_division"]
          duration_minutes: number
          generated_by_ai: boolean
          generation_metadata: Json | null
          id: string
          scheduled_at: string
          season_year: number
          slug: string
          status: Database["public"]["Enums"]["contest_status"]
          title_en: string
          title_es: string
          updated_at: string
        }
        Insert: {
          calculator_allowed?: boolean
          contest_number: number
          created_at?: string
          division: Database["public"]["Enums"]["school_division"]
          duration_minutes?: number
          generated_by_ai?: boolean
          generation_metadata?: Json | null
          id?: string
          scheduled_at: string
          season_year: number
          slug: string
          status?: Database["public"]["Enums"]["contest_status"]
          title_en: string
          title_es: string
          updated_at?: string
        }
        Update: {
          calculator_allowed?: boolean
          contest_number?: number
          created_at?: string
          division?: Database["public"]["Enums"]["school_division"]
          duration_minutes?: number
          generated_by_ai?: boolean
          generation_metadata?: Json | null
          id?: string
          scheduled_at?: string
          season_year?: number
          slug?: string
          status?: Database["public"]["Enums"]["contest_status"]
          title_en?: string
          title_es?: string
          updated_at?: string
        }
        Relationships: []
      }
      problem_attempts: {
        Row: {
          answer_submitted: string | null
          answered_at: string | null
          contest_attempt_id: string
          id: string
          is_correct: boolean | null
          points_earned: number
          problem_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answer_submitted?: string | null
          answered_at?: string | null
          contest_attempt_id: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number
          problem_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answer_submitted?: string | null
          answered_at?: string | null
          contest_attempt_id?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number
          problem_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "problem_attempts_contest_attempt_id_fkey"
            columns: ["contest_attempt_id"]
            isOneToOne: false
            referencedRelation: "contest_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_attempts_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          answer_type: Database["public"]["Enums"]["answer_type"]
          body_en: string
          body_es: string
          category: Database["public"]["Enums"]["problem_category"]
          created_at: string
          diagram_caption_en: string | null
          diagram_caption_es: string | null
          diagram_svg_url: string | null
          division: Database["public"]["Enums"]["school_division"]
          expected_answer: string
          explanation_en: string
          explanation_es: string
          format_directive_en: string | null
          format_directive_es: string | null
          generated_by_ai: boolean
          generation_metadata: Json | null
          has_diagram: boolean
          id: string
          points: number
          published: boolean
          slug: string
          source: string | null
          source_year: number | null
          stars: number
          title_en: string
          title_es: string
          updated_at: string
        }
        Insert: {
          answer_type: Database["public"]["Enums"]["answer_type"]
          body_en: string
          body_es: string
          category: Database["public"]["Enums"]["problem_category"]
          created_at?: string
          diagram_caption_en?: string | null
          diagram_caption_es?: string | null
          diagram_svg_url?: string | null
          division: Database["public"]["Enums"]["school_division"]
          expected_answer: string
          explanation_en: string
          explanation_es: string
          format_directive_en?: string | null
          format_directive_es?: string | null
          generated_by_ai?: boolean
          generation_metadata?: Json | null
          has_diagram?: boolean
          id?: string
          points?: number
          published?: boolean
          slug: string
          source?: string | null
          source_year?: number | null
          stars: number
          title_en: string
          title_es: string
          updated_at?: string
        }
        Update: {
          answer_type?: Database["public"]["Enums"]["answer_type"]
          body_en?: string
          body_es?: string
          category?: Database["public"]["Enums"]["problem_category"]
          created_at?: string
          diagram_caption_en?: string | null
          diagram_caption_es?: string | null
          diagram_svg_url?: string | null
          division?: Database["public"]["Enums"]["school_division"]
          expected_answer?: string
          explanation_en?: string
          explanation_es?: string
          format_directive_en?: string | null
          format_directive_es?: string | null
          generated_by_ai?: boolean
          generation_metadata?: Json | null
          has_diagram?: boolean
          id?: string
          points?: number
          published?: boolean
          slug?: string
          source?: string | null
          source_year?: number | null
          stars?: number
          title_en?: string
          title_es?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      my_immutable_profile_fields: {
        Args: never
        Returns: {
          current_streak: number
          level: number
          longest_streak: number
          user_role: Database["public"]["Enums"]["user_role"]
          xp_total: number
        }[]
      }
      my_school_id: { Args: never; Returns: string }
      profile_immutable_fields: {
        Args: { p_id: string }
        Returns: {
          user_role: Database["public"]["Enums"]["user_role"]
          xp_total: number
        }[]
      }
    }
    Enums: {
      answer_type:
        | "integer"
        | "pair_integer"
        | "pair_decimal"
        | "fraction_simplified"
        | "decimal_cents"
        | "symbolic_pi"
        | "with_units"
        | "multiple_choice"
      contest_status: "draft" | "scheduled" | "active" | "closed"
      problem_category:
        | "algebra"
        | "number_theory"
        | "plane_geometry"
        | "counting_combinatorics"
        | "probability"
        | "ratios_proportions"
        | "percentages"
        | "rate_time_distance"
        | "money"
        | "statistics"
        | "sequences_patterns"
        | "logic"
        | "fractions_decimals"
        | "time_clocks"
        | "mixtures"
        | "sets_venn"
        | "custom_operators"
        | "geometry_3d"
        | "pythagoras"
      school_division: "elementary" | "middle"
      session_status: "open" | "closed" | "expired"
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
      answer_type: [
        "integer",
        "pair_integer",
        "pair_decimal",
        "fraction_simplified",
        "decimal_cents",
        "symbolic_pi",
        "with_units",
        "multiple_choice",
      ],
      contest_status: ["draft", "scheduled", "active", "closed"],
      problem_category: [
        "algebra",
        "number_theory",
        "plane_geometry",
        "counting_combinatorics",
        "probability",
        "ratios_proportions",
        "percentages",
        "rate_time_distance",
        "money",
        "statistics",
        "sequences_patterns",
        "logic",
        "fractions_decimals",
        "time_clocks",
        "mixtures",
        "sets_venn",
        "custom_operators",
        "geometry_3d",
        "pythagoras",
      ],
      school_division: ["elementary", "middle"],
      user_role: ["student", "parent", "teacher", "admin"],
    },
  },
} as const
