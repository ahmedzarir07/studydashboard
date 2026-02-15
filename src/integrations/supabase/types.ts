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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_preferences: {
        Row: {
          ai_behavior: string | null
          ai_expectation: string[] | null
          biggest_problem: string | null
          college_name: string | null
          completed: boolean
          created_at: string
          current_class: string | null
          help_type: string[] | null
          id: string
          main_goal: string | null
          preferred_language: string | null
          student_level: string | null
          student_name: string | null
          study_hours: string | null
          updated_at: string
          user_id: string
          weak_subjects: string[] | null
        }
        Insert: {
          ai_behavior?: string | null
          ai_expectation?: string[] | null
          biggest_problem?: string | null
          college_name?: string | null
          completed?: boolean
          created_at?: string
          current_class?: string | null
          help_type?: string[] | null
          id?: string
          main_goal?: string | null
          preferred_language?: string | null
          student_level?: string | null
          student_name?: string | null
          study_hours?: string | null
          updated_at?: string
          user_id: string
          weak_subjects?: string[] | null
        }
        Update: {
          ai_behavior?: string | null
          ai_expectation?: string[] | null
          biggest_problem?: string | null
          college_name?: string | null
          completed?: boolean
          created_at?: string
          current_class?: string | null
          help_type?: string[] | null
          id?: string
          main_goal?: string | null
          preferred_language?: string | null
          student_level?: string | null
          student_name?: string | null
          study_hours?: string | null
          updated_at?: string
          user_id?: string
          weak_subjects?: string[] | null
        }
        Relationships: []
      }
      chapter_completions: {
        Row: {
          chapter: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          is_public: boolean
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chapter_resources: {
        Row: {
          chapter: string
          created_at: string
          id: string
          subject: string
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          chapter: string
          created_at?: string
          id?: string
          subject: string
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          chapter?: string
          created_at?: string
          id?: string
          subject?: string
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      doubt_answers: {
        Row: {
          answer_text: string
          created_at: string
          doubt_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_text: string
          created_at?: string
          doubt_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          doubt_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_answers_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_reports: {
        Row: {
          answer_id: string | null
          created_at: string
          doubt_id: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          answer_id?: string | null
          created_at?: string
          doubt_id?: string | null
          id?: string
          reason?: string
          user_id: string
        }
        Update: {
          answer_id?: string | null
          created_at?: string
          doubt_id?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_reports_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "doubt_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubt_reports_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_votes: {
        Row: {
          answer_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          answer_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          answer_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_votes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "doubt_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      doubts: {
        Row: {
          chapter: string | null
          created_at: string
          id: string
          image_url: string | null
          is_resolved: boolean
          question: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_resolved?: boolean
          question: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_resolved?: boolean
          question?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drive_connections: {
        Row: {
          access_token: string
          connected_at: string
          email: string | null
          id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          email?: string | null
          id?: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          email?: string | null
          id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_study_plans: {
        Row: {
          chapter: string
          created_at: string
          goals: string | null
          id: string
          month_year: string
          notes: string | null
          planned_activities: string[]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter: string
          created_at?: string
          goals?: string | null
          id?: string
          month_year: string
          notes?: string | null
          planned_activities?: string[]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string
          created_at?: string
          goals?: string | null
          id?: string
          month_year?: string
          notes?: string | null
          planned_activities?: string[]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          batch: string | null
          board_name: string | null
          board_roll: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          google_linked: boolean | null
          group_name: string | null
          id: string
          last_active_at: string | null
          optional_subjects: string[] | null
          passing_year: number | null
          phone_number: string | null
          phone_verified: boolean | null
          registration_number: string | null
          study_type: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          batch?: string | null
          board_name?: string | null
          board_roll?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          google_linked?: boolean | null
          group_name?: string | null
          id?: string
          last_active_at?: string | null
          optional_subjects?: string[] | null
          passing_year?: number | null
          phone_number?: string | null
          phone_verified?: boolean | null
          registration_number?: string | null
          study_type?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          batch?: string | null
          board_name?: string | null
          board_roll?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          google_linked?: boolean | null
          group_name?: string | null
          id?: string
          last_active_at?: string | null
          optional_subjects?: string[] | null
          passing_year?: number | null
          phone_number?: string | null
          phone_verified?: boolean | null
          registration_number?: string | null
          study_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_coach_settings: {
        Row: {
          batch: string
          completion_percentage: number
          created_at: string
          id: string
          last_notification_sent: string | null
          months_remaining: number
          notification_email: string | null
          notification_time: string
          notifications_enabled: boolean
          risk_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          batch: string
          completion_percentage: number
          created_at?: string
          id?: string
          last_notification_sent?: string | null
          months_remaining: number
          notification_email?: string | null
          notification_time?: string
          notifications_enabled?: boolean
          risk_level: string
          updated_at?: string
          user_id: string
        }
        Update: {
          batch?: string
          completion_percentage?: number
          created_at?: string
          id?: string
          last_notification_sent?: string | null
          months_remaining?: number
          notification_email?: string | null
          notification_time?: string
          notifications_enabled?: boolean
          risk_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_records: {
        Row: {
          activity: string
          chapter: string
          class_number: number | null
          created_at: string
          id: string
          is_public: boolean
          status: string | null
          subject: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity: string
          chapter: string
          class_number?: number | null
          created_at?: string
          id?: string
          is_public?: boolean
          status?: string | null
          subject: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity?: string
          chapter?: string
          class_number?: number | null
          created_at?: string
          id?: string
          is_public?: boolean
          status?: string | null
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      public_chapter_progress: {
        Row: {
          chapter: string | null
          completed: boolean | null
          completed_at: string | null
          display_name: string | null
          id: string | null
          profile_id: string | null
          subject: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      public_study_progress: {
        Row: {
          activity: string | null
          chapter: string | null
          display_name: string | null
          id: string | null
          profile_id: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_first_user: { Args: never; Returns: boolean }
      update_last_active: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
