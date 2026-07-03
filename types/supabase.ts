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
      actual_results: {
        Row: {
          actual_marks: number | null
          actual_percentile: number | null
          created_at: string | null
          exam_name: string
          id: string
          opted_in: boolean | null
          prediction_id: string | null
          session_label: string
          subject_breakdown: Json | null
          user_id: string
        }
        Insert: {
          actual_marks?: number | null
          actual_percentile?: number | null
          created_at?: string | null
          exam_name: string
          id?: string
          opted_in?: boolean | null
          prediction_id?: string | null
          session_label: string
          subject_breakdown?: Json | null
          user_id: string
        }
        Update: {
          actual_marks?: number | null
          actual_percentile?: number | null
          created_at?: string | null
          exam_name?: string
          id?: string
          opted_in?: boolean | null
          prediction_id?: string | null
          session_label?: string
          subject_breakdown?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actual_results_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      calibration_snapshots: {
        Row: {
          active_users_eligible: number | null
          coverage: number | null
          coverage_segmented: Json | null
          created_at: string | null
          exam_date: string
          exam_name: string
          freeze_date: string
          id: string
          report_json: Json | null
          results_date: string | null
          session_label: string
          sharpness_median_width: number | null
          total_users_frozen: number | null
          updated_at: string | null
        }
        Insert: {
          active_users_eligible?: number | null
          coverage?: number | null
          coverage_segmented?: Json | null
          created_at?: string | null
          exam_date: string
          exam_name: string
          freeze_date: string
          id?: string
          report_json?: Json | null
          results_date?: string | null
          session_label: string
          sharpness_median_width?: number | null
          total_users_frozen?: number | null
          updated_at?: string | null
        }
        Update: {
          active_users_eligible?: number | null
          coverage?: number | null
          coverage_segmented?: Json | null
          created_at?: string | null
          exam_date?: string
          exam_name?: string
          freeze_date?: string
          id?: string
          report_json?: Json | null
          results_date?: string | null
          session_label?: string
          sharpness_median_width?: number | null
          total_users_frozen?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comeback_queue_items: {
        Row: {
          cleared: boolean | null
          created_at: string | null
          delayed_passed: boolean | null
          difficulty_tier: string
          exam_profile_id: string
          explanation_shown: boolean | null
          id: string
          immediate_passed: boolean | null
          lost_projected_points: number | null
          original_session_id: string | null
          question_id: string
          skill_domain: string
          stage: string
          stage_deadline: string | null
          transfer_passed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cleared?: boolean | null
          created_at?: string | null
          delayed_passed?: boolean | null
          difficulty_tier: string
          exam_profile_id: string
          explanation_shown?: boolean | null
          id?: string
          immediate_passed?: boolean | null
          lost_projected_points?: number | null
          original_session_id?: string | null
          question_id: string
          skill_domain: string
          stage?: string
          stage_deadline?: string | null
          transfer_passed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cleared?: boolean | null
          created_at?: string | null
          delayed_passed?: boolean | null
          difficulty_tier?: string
          exam_profile_id?: string
          explanation_shown?: boolean | null
          id?: string
          immediate_passed?: boolean | null
          lost_projected_points?: number | null
          original_session_id?: string | null
          question_id?: string
          skill_domain?: string
          stage?: string
          stage_deadline?: string | null
          transfer_passed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comeback_queue_items_exam_profile_id_fkey"
            columns: ["exam_profile_id"]
            isOneToOne: false
            referencedRelation: "exam_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "comeback_queue_items_original_session_id_fkey"
            columns: ["original_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_time_logs: {
        Row: {
          created_at: string | null
          difficulty_tier: string
          id: string
          questions_attempted: number | null
          questions_correct: number | null
          session_id: string | null
          skill_domain: string
          time_to_mastery_minutes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty_tier: string
          id?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          session_id?: string | null
          skill_domain: string
          time_to_mastery_minutes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          difficulty_tier?: string
          id?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          session_id?: string | null
          skill_domain?: string
          time_to_mastery_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_time_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      concept_mastery: {
        Row: {
          created_at: string | null
          exam_profile_id: string
          id: string
          last_seen_at: string
          mastery_score: number
          next_review_at: string
          review_ease_factor: number
          review_interval_days: number
          skill_domain: string
          streak: number
          total_attempted: number
          total_correct: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exam_profile_id: string
          id?: string
          last_seen_at?: string
          mastery_score?: number
          next_review_at?: string
          review_ease_factor?: number
          review_interval_days?: number
          skill_domain: string
          streak?: number
          total_attempted?: number
          total_correct?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          exam_profile_id?: string
          id?: string
          last_seen_at?: string
          mastery_score?: number
          next_review_at?: string
          review_ease_factor?: number
          review_interval_days?: number
          skill_domain?: string
          streak?: number
          total_attempted?: number
          total_correct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_mastery_exam_profile_id_fkey"
            columns: ["exam_profile_id"]
            isOneToOne: false
            referencedRelation: "exam_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      exam_profiles: {
        Row: {
          active_targets: string[]
          created_at: string | null
          exam_name: string
          is_active: boolean | null
          phone: string | null
          profile_id: string
          target_date: string
          time_mode: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_targets?: string[]
          created_at?: string | null
          exam_name: string
          is_active?: boolean | null
          phone?: string | null
          profile_id?: string
          target_date: string
          time_mode?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_targets?: string[]
          created_at?: string | null
          exam_name?: string
          is_active?: boolean | null
          phone?: string | null
          profile_id?: string
          target_date?: string
          time_mode?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exam_topic_weights: {
        Row: {
          c_tier_cap: number | null
          created_at: string | null
          difficulty_tier: string
          estimated_minutes_to_mastery: number | null
          exam_name: string
          exam_weight: number
          id: string
          question_frequency_10yr: number | null
          skill_domain: string
          subject: string
          topic: string
        }
        Insert: {
          c_tier_cap?: number | null
          created_at?: string | null
          difficulty_tier?: string
          estimated_minutes_to_mastery?: number | null
          exam_name: string
          exam_weight: number
          id?: string
          question_frequency_10yr?: number | null
          skill_domain: string
          subject: string
          topic: string
        }
        Update: {
          c_tier_cap?: number | null
          created_at?: string | null
          difficulty_tier?: string
          estimated_minutes_to_mastery?: number | null
          exam_name?: string
          exam_weight?: number
          id?: string
          question_frequency_10yr?: number | null
          skill_domain?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
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
      generation_usage: {
        Row: {
          created_at: string
          id: number
          question_count: number
          quiz_id: string
          token_estimate: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          question_count: number
          quiz_id: string
          token_estimate?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          question_count?: number
          quiz_id?: string
          token_estimate?: number
          user_id?: string
        }
        Relationships: []
      }
      mastery_history: {
        Row: {
          exam_profile_id: string
          id: string
          mastery_score: number
          recorded_at: string | null
          skill_domain: string
          user_id: string
        }
        Insert: {
          exam_profile_id: string
          id?: string
          mastery_score: number
          recorded_at?: string | null
          skill_domain: string
          user_id: string
        }
        Update: {
          exam_profile_id?: string
          id?: string
          mastery_score?: number
          recorded_at?: string | null
          skill_domain?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_history_exam_profile_id_fkey"
            columns: ["exam_profile_id"]
            isOneToOne: false
            referencedRelation: "exam_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      practice_questions: {
        Row: {
          domain: string
          exam_name: string
          generated_at: string | null
          id: string
          questions_json: Json
          subject: string
        }
        Insert: {
          domain: string
          exam_name: string
          generated_at?: string | null
          id?: string
          questions_json: Json
          subject: string
        }
        Update: {
          domain?: string
          exam_name?: string
          generated_at?: string | null
          id?: string
          questions_json?: Json
          subject?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          band_lower: number
          band_upper: number
          calibration_source: string | null
          created_at: string | null
          exam_profile_id: string
          frozen_at: string | null
          id: string
          is_frozen: boolean | null
          predicted_percentile: number | null
          sessions_used: number | null
          subject_breakdown: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          band_lower: number
          band_upper: number
          calibration_source?: string | null
          created_at?: string | null
          exam_profile_id: string
          frozen_at?: string | null
          id?: string
          is_frozen?: boolean | null
          predicted_percentile?: number | null
          sessions_used?: number | null
          subject_breakdown?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          band_lower?: number
          band_upper?: number
          calibration_source?: string | null
          created_at?: string | null
          exam_profile_id?: string
          frozen_at?: string | null
          id?: string
          is_frozen?: boolean | null
          predicted_percentile?: number | null
          sessions_used?: number | null
          subject_breakdown?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_exam_profile_id_fkey"
            columns: ["exam_profile_id"]
            isOneToOne: false
            referencedRelation: "exam_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      predictor_sessions: {
        Row: {
          created_at: string | null
          exam_name: string
          exam_profile_id: string | null
          id: string
          otp_attempts: number | null
          otp_expires_at: string
          otp_hash: string
          phone: string
          target_date: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          exam_name: string
          exam_profile_id?: string | null
          id?: string
          otp_attempts?: number | null
          otp_expires_at: string
          otp_hash: string
          phone: string
          target_date: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          exam_name?: string
          exam_profile_id?: string | null
          id?: string
          otp_attempts?: number | null
          otp_expires_at?: string
          otp_hash?: string
          phone?: string
          target_date?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictor_sessions_exam_profile_id_fkey"
            columns: ["exam_profile_id"]
            isOneToOne: false
            referencedRelation: "exam_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
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
      question_results: {
        Row: {
          correct: boolean
          created_at: string | null
          difficulty_tier: string | null
          id: number
          misconception: string | null
          question_id: number
          quiz_id: string
          skill_domain: string
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          correct: boolean
          created_at?: string | null
          difficulty_tier?: string | null
          id?: never
          misconception?: string | null
          question_id: number
          quiz_id: string
          skill_domain?: string
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          correct?: boolean
          created_at?: string | null
          difficulty_tier?: string | null
          id?: never
          misconception?: string | null
          question_id?: number
          quiz_id?: string
          skill_domain?: string
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_option: string
          created_at: string | null
          explanation: string | null
          group_id: number | null
          metadata_json: Json | null
          options: Json
          question_id: number
          question_text: string
          quiz_id: string | null
          topics: Json | null
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          explanation?: string | null
          group_id?: number | null
          metadata_json?: Json | null
          options: Json
          question_id?: number
          question_text: string
          quiz_id?: string | null
          topics?: Json | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          explanation?: string | null
          group_id?: number | null
          metadata_json?: Json | null
          options?: Json
          question_id?: number
          question_text?: string
          quiz_id?: string | null
          topics?: Json | null
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
      result_cards: {
        Row: {
          card_data: Json
          card_type: string
          created_at: string | null
          expires_at: string
          id: string
          share_token: string
          user_id: string
          view_count: number
        }
        Insert: {
          card_data: Json
          card_type: string
          created_at?: string | null
          expires_at: string
          id?: string
          share_token?: string
          user_id: string
          view_count?: number
        }
        Update: {
          card_data?: Json
          card_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          share_token?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      session_answers: {
        Row: {
          answered_at: string | null
          exam_profile_id: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option: string | null
          session_id: string
          skill_domain: string
          time_to_answer_ms: number | null
          user_id: string
          was_revealed: boolean
        }
        Insert: {
          answered_at?: string | null
          exam_profile_id: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_option?: string | null
          session_id: string
          skill_domain: string
          time_to_answer_ms?: number | null
          user_id: string
          was_revealed?: boolean
        }
        Update: {
          answered_at?: string | null
          exam_profile_id?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option?: string | null
          session_id?: string
          skill_domain?: string
          time_to_answer_ms?: number | null
          user_id?: string
          was_revealed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "question_results_exam_profile_id_fkey"
            columns: ["exam_profile_id"]
            isOneToOne: false
            referencedRelation: "exam_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "question_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          exam_profile_id: string
          id: string
          questions_json: Json
          session_intent: string
          status: string
          target_domains: string[]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          exam_profile_id: string
          id?: string
          questions_json: Json
          session_intent?: string
          status?: string
          target_domains: string[]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          exam_profile_id?: string
          id?: string
          questions_json?: Json
          session_intent?: string
          status?: string
          target_domains?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_exam_profile_id_fkey"
            columns: ["exam_profile_id"]
            isOneToOne: false
            referencedRelation: "exam_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
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
      submit_answer: {
        Args: {
          p_exam_profile_id: string
          p_is_correct: boolean
          p_question_id: string
          p_selected_option: string
          p_session_id: string
          p_skill_domain: string
          p_time_to_answer_ms: number
          p_user_id: string
          p_was_revealed: boolean
        }
        Returns: {
          inserted: boolean
        }[]
      }
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
