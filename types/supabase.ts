export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      feedback_backup: {
        Row: {
          created_at: string | null
          id: string | null
          message: string | null
          rating: number | null
          type: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          rating?: number | null
          type?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          rating?: number | null
          type?: string | null
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
      question_groups_backup: {
        Row: {
          caption: string | null
          created_at: string | null
          group_id: number | null
          group_order: number | null
          quiz_id: string | null
          supporting_content: string | null
          supporting_content_type: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          group_id?: number | null
          group_order?: number | null
          quiz_id?: string | null
          supporting_content?: string | null
          supporting_content_type?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          group_id?: number | null
          group_order?: number | null
          quiz_id?: string | null
          supporting_content?: string | null
          supporting_content_type?: string | null
        }
        Relationships: []
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
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          group_id?: number | null
          options: Json
          question_id?: number
          question_text: string
          quiz_id?: string | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          group_id?: number | null
          options?: Json
          question_id?: number
          question_text?: string
          quiz_id?: string | null
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
      questions_backup: {
        Row: {
          correct_option: string | null
          created_at: string | null
          group_id: number | null
          options: Json | null
          question_id: number | null
          question_text: string | null
          quiz_id: string | null
        }
        Insert: {
          correct_option?: string | null
          created_at?: string | null
          group_id?: number | null
          options?: Json | null
          question_id?: number | null
          question_text?: string | null
          quiz_id?: string | null
        }
        Update: {
          correct_option?: string | null
          created_at?: string | null
          group_id?: number | null
          options?: Json | null
          question_id?: number | null
          question_text?: string | null
          quiz_id?: string | null
        }
        Relationships: []
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
          question_count: number | null
          questions: Json[] | null
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
          question_count?: number | null
          questions?: Json[] | null
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
          question_count?: number | null
          questions?: Json[] | null
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
      quizzes_backup: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty: string | null
          is_public: boolean | null
          language: string | null
          metadata_json: Json | null
          question_count: number | null
          questions: Json[] | null
          quiz_id: string | null
          slug: string | null
          status: string | null
          subject: string | null
          title: string | null
          topic: string | null
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
          question_count?: number | null
          questions?: Json[] | null
          quiz_id?: string | null
          slug?: string | null
          status?: string | null
          subject?: string | null
          title?: string | null
          topic?: string | null
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
          question_count?: number | null
          questions?: Json[] | null
          quiz_id?: string | null
          slug?: string | null
          status?: string | null
          subject?: string | null
          title?: string | null
          topic?: string | null
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
          quiz_id: string
          title: string
          description: string
          topic: string
          subject: string
          difficulty: string
          language: string
          status: string
          creator_id: string
          is_public: boolean
          created_at: string
          question_count: number
        }[]
      }
      restore_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_quiz_question_count: {
        Args: { p_quiz_id: string; p_question_count: number }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
