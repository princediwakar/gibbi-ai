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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string
          rating: number | null
          type: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          rating?: number | null
          type: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          rating?: number | null
          type?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      question_groups: {
        Row: {
          caption: string | null
          created_at: string | null
          group_id: number
          group_order: number
          quiz_id: string
          supporting_content: string
          supporting_content_type: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          group_id?: number
          group_order?: number
          quiz_id: string
          supporting_content: string
          supporting_content_type: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          group_id?: number
          group_order?: number
          quiz_id?: string
          supporting_content?: string
          supporting_content_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_groups_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_with_counts"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "question_groups_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_option: string
          created_at: string | null
          group_id: number | null
          options: Json
          question_id: number
          question_text: string
          quiz_id: string | null
          topics: string[] | null
          explanation: string | null
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          group_id?: number | null
          options: Json
          question_id?: number
          question_text: string
          quiz_id?: string | null
          topics?: string[] | null
          explanation?: string | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          group_id?: number | null
          options?: Json
          question_id?: number
          question_text?: string
          quiz_id?: string | null
          topics?: string[] | null
          explanation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "question_groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_with_counts"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string | null
          quiz_id: string
          result_id: string
          score: number
          time_taken: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          created_at?: string | null
          quiz_id: string
          result_id?: string
          score: number
          time_taken?: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string | null
          quiz_id?: string
          result_id?: string
          score?: number
          time_taken?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_with_counts"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty: string | null
          is_public: boolean | null
          language: string | null
          metadata_json: Json | null
          quiz_id: string
          slug: string | null
          status: string
          subject: string | null
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          is_public?: boolean | null
          language?: string | null
          metadata_json?: Json | null
          quiz_id?: string
          slug?: string | null
          status?: string
          subject?: string | null
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          is_public?: boolean | null
          language?: string | null
          metadata_json?: Json | null
          quiz_id?: string
          slug?: string | null
          status?: string
          subject?: string | null
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      quiz_with_counts: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty: string | null
          is_public: boolean | null
          language: string | null
          metadata_json: Json | null
          question_count: number | null
          quiz_id: string | null
          slug: string | null
          status: string | null
          subject: string | null
          title: string | null
          topic: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_public_quizzes_with_min_count: {
        Args: {
          min_count?: number
          page_num?: number
          page_size?: number
          search_term?: string
        }
        Returns: {
          created_at: string
          creator_id: string
          description: string
          difficulty: string
          is_public: boolean
          language: string
          question_count: number
          quiz_id: string
          status: string
          subject: string
          title: string
          topic: string
        }[]
      }
      restore_tables: { Args: never; Returns: undefined }
      update_quiz_question_count: {
        Args: { p_question_count: number; p_quiz_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
