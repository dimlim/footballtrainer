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
      achievements: {
        Row: {
          condition_type: string
          condition_value: number
          description: Json
          icon: string
          id: string
          title: Json
          xp_reward: number
        }
        Insert: {
          condition_type: string
          condition_value: number
          description: Json
          icon: string
          id?: string
          title: Json
          xp_reward?: number
        }
        Update: {
          condition_type?: string
          condition_value?: number
          description?: Json
          icon?: string
          id?: string
          title?: Json
          xp_reward?: number
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assigned_programs: {
        Row: {
          assigned_by: string
          created_at: string
          id: string
          player_id: string
          program_id: string
          schedule: Json | null
          start_date: string
          status: string
        }
        Insert: {
          assigned_by: string
          created_at?: string
          id?: string
          player_id: string
          program_id: string
          schedule?: Json | null
          start_date: string
          status?: string
        }
        Update: {
          assigned_by?: string
          created_at?: string
          id?: string
          player_id?: string
          program_id?: string
          schedule?: Json | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "assigned_programs_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_programs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_verification_queue: {
        Row: {
          activity_id: string | null
          activity_type: string
          coach_comment: string | null
          coach_id: string
          created_at: string
          id: string
          player_id: string
          reason: string | null
          reviewed_at: string | null
          status: string | null
          team_id: string | null
        }
        Insert: {
          activity_id?: string | null
          activity_type: string
          coach_comment?: string | null
          coach_id: string
          created_at?: string
          id?: string
          player_id: string
          reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          team_id?: string | null
        }
        Update: {
          activity_id?: string | null
          activity_type?: string
          coach_comment?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          player_id?: string
          reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_verification_queue_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_verification_queue_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_verification_queue_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_fitness_data: {
        Row: {
          active_minutes: number | null
          calories: number | null
          created_at: string
          date: string
          distance_meters: number | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: string
          player_id: string
          sleep_hours: number | null
          source: string | null
          steps: number | null
          updated_at: string
        }
        Insert: {
          active_minutes?: number | null
          calories?: number | null
          created_at?: string
          date: string
          distance_meters?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          player_id: string
          sleep_hours?: number | null
          source?: string | null
          steps?: number | null
          updated_at?: string
        }
        Update: {
          active_minutes?: number | null
          calories?: number | null
          created_at?: string
          date?: string
          distance_meters?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          player_id?: string
          sleep_hours?: number | null
          source?: string | null
          steps?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_fitness_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      day_sections: {
        Row: {
          created_at: string
          day_id: string
          duration_minutes: number | null
          id: string
          order_index: number
          title_cs: string | null
          title_en: string | null
          title_uk: string
        }
        Insert: {
          created_at?: string
          day_id: string
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title_cs?: string | null
          title_en?: string | null
          title_uk: string
        }
        Update: {
          created_at?: string
          day_id?: string
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title_cs?: string | null
          title_en?: string | null
          title_uk?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_sections_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_timing: {
        Row: {
          actual_duration_seconds: number | null
          coach_notes: string | null
          completed_at: string | null
          day_key: string
          exercise_id: string
          expected_duration_seconds: number | null
          id: string
          is_suspicious: boolean | null
          player_id: string
          started_at: string
          verification_status: string | null
        }
        Insert: {
          actual_duration_seconds?: number | null
          coach_notes?: string | null
          completed_at?: string | null
          day_key: string
          exercise_id: string
          expected_duration_seconds?: number | null
          id?: string
          is_suspicious?: boolean | null
          player_id: string
          started_at: string
          verification_status?: string | null
        }
        Update: {
          actual_duration_seconds?: number | null
          coach_notes?: string | null
          completed_at?: string | null
          day_key?: string
          exercise_id?: string
          expected_duration_seconds?: number | null
          id?: string
          is_suspicious?: boolean | null
          player_id?: string
          started_at?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_timing_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description_cs: string[] | null
          description_en: string[] | null
          description_uk: string[] | null
          exercise_type: string
          id: string
          image_url: string | null
          input_label_cs: string | null
          input_label_en: string | null
          input_label_uk: string | null
          note_cs: string | null
          note_en: string | null
          note_uk: string | null
          order_index: number
          reps_cs: string | null
          reps_en: string | null
          reps_uk: string | null
          rest_seconds: number | null
          section_id: string
          sets_cs: string | null
          sets_en: string | null
          sets_uk: string | null
          timer_duration: number | null
          title_cs: string | null
          title_en: string | null
          title_uk: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description_cs?: string[] | null
          description_en?: string[] | null
          description_uk?: string[] | null
          exercise_type?: string
          id?: string
          image_url?: string | null
          input_label_cs?: string | null
          input_label_en?: string | null
          input_label_uk?: string | null
          note_cs?: string | null
          note_en?: string | null
          note_uk?: string | null
          order_index?: number
          reps_cs?: string | null
          reps_en?: string | null
          reps_uk?: string | null
          rest_seconds?: number | null
          section_id: string
          sets_cs?: string | null
          sets_en?: string | null
          sets_uk?: string | null
          timer_duration?: number | null
          title_cs?: string | null
          title_en?: string | null
          title_uk: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description_cs?: string[] | null
          description_en?: string[] | null
          description_uk?: string[] | null
          exercise_type?: string
          id?: string
          image_url?: string | null
          input_label_cs?: string | null
          input_label_en?: string | null
          input_label_uk?: string | null
          note_cs?: string | null
          note_en?: string | null
          note_uk?: string | null
          order_index?: number
          reps_cs?: string | null
          reps_en?: string | null
          reps_uk?: string | null
          rest_seconds?: number | null
          section_id?: string
          sets_cs?: string | null
          sets_en?: string | null
          sets_uk?: string | null
          timer_duration?: number | null
          title_cs?: string | null
          title_en?: string | null
          title_uk?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "day_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_goals: {
        Row: {
          created_at: string
          current_value: number | null
          end_date: string | null
          goal_type: string
          id: string
          is_active: boolean
          period: string
          player_id: string
          start_date: string
          target_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          end_date?: string | null
          goal_type: string
          id?: string
          is_active?: boolean
          period?: string
          player_id: string
          start_date?: string
          target_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          end_date?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean
          period?: string
          player_id?: string
          start_date?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitness_goals_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          body: string | null
          clicked_at: string | null
          data: Json | null
          dismissed_at: string | null
          id: string
          notification_type: string
          player_id: string
          sent_at: string
          title: string
        }
        Insert: {
          body?: string | null
          clicked_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          id?: string
          notification_type: string
          player_id: string
          sent_at?: string
          title: string
        }
        Update: {
          body?: string | null
          clicked_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          id?: string
          notification_type?: string
          player_id?: string
          sent_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          achievement_unlocked: boolean
          coach_message: boolean
          created_at: string
          id: string
          player_id: string
          reminder_time: string
          streak_warning: boolean
          team_update: boolean
          training_reminder: boolean
          updated_at: string
        }
        Insert: {
          achievement_unlocked?: boolean
          coach_message?: boolean
          created_at?: string
          id?: string
          player_id: string
          reminder_time?: string
          streak_warning?: boolean
          team_update?: boolean
          training_reminder?: boolean
          updated_at?: string
        }
        Update: {
          achievement_unlocked?: boolean
          coach_message?: boolean
          created_at?: string
          id?: string
          player_id?: string
          reminder_time?: string
          streak_warning?: boolean
          team_update?: boolean
          training_reminder?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          invoice_pdf: string | null
          product_id: string | null
          receipt_url: string | null
          status: string
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          team_subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          invoice_pdf?: string | null
          product_id?: string | null
          receipt_url?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          team_subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          invoice_pdf?: string | null
          product_id?: string | null
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          team_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_team_subscription_id_fkey"
            columns: ["team_subscription_id"]
            isOneToOne: false
            referencedRelation: "team_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          notified: boolean
          player_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          notified?: boolean
          player_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          notified?: boolean
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_activity_log: {
        Row: {
          activity_type: string
          created_at: string
          day_key: string | null
          device_type: string | null
          exercise_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          player_id: string
          program_id: string | null
          user_agent: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          day_key?: string | null
          device_type?: string | null
          exercise_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          player_id: string
          program_id?: string | null
          user_agent?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          day_key?: string | null
          device_type?: string | null
          exercise_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          player_id?: string
          program_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_activity_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_calendar: {
        Row: {
          calendar_date: string
          created_at: string | null
          day_type: Database["public"]["Enums"]["training_day_type"]
          description: string | null
          duration_minutes: number | null
          id: string
          intensity: Database["public"]["Enums"]["intensity_level"] | null
          is_completed: boolean | null
          is_rescheduled: boolean | null
          is_skipped: boolean | null
          original_date: string | null
          player_id: string
          player_notes: string | null
          program_day_id: string | null
          program_id: string | null
          scheduled_time: string | null
          team_event_id: string | null
          team_schedule_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_date: string
          created_at?: string | null
          day_type: Database["public"]["Enums"]["training_day_type"]
          description?: string | null
          duration_minutes?: number | null
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          is_completed?: boolean | null
          is_rescheduled?: boolean | null
          is_skipped?: boolean | null
          original_date?: string | null
          player_id: string
          player_notes?: string | null
          program_day_id?: string | null
          program_id?: string | null
          scheduled_time?: string | null
          team_event_id?: string | null
          team_schedule_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_date?: string
          created_at?: string | null
          day_type?: Database["public"]["Enums"]["training_day_type"]
          description?: string | null
          duration_minutes?: number | null
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          is_completed?: boolean | null
          is_rescheduled?: boolean | null
          is_skipped?: boolean | null
          original_date?: string | null
          player_id?: string
          player_notes?: string | null
          program_day_id?: string | null
          program_id?: string | null
          scheduled_time?: string | null
          team_event_id?: string | null
          team_schedule_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_calendar_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_calendar_team_event_id_fkey"
            columns: ["team_event_id"]
            isOneToOne: false
            referencedRelation: "team_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_calendar_team_schedule_id_fkey"
            columns: ["team_schedule_id"]
            isOneToOne: false
            referencedRelation: "team_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      player_daily_summary: {
        Row: {
          date: string
          days_completed: number | null
          exercises_completed: number | null
          exercises_started: number | null
          first_activity: string | null
          id: string
          last_activity: string | null
          login_count: number | null
          player_id: string
          suspicious_activities: number | null
          total_active_minutes: number | null
          xp_earned: number | null
        }
        Insert: {
          date: string
          days_completed?: number | null
          exercises_completed?: number | null
          exercises_started?: number | null
          first_activity?: string | null
          id?: string
          last_activity?: string | null
          login_count?: number | null
          player_id: string
          suspicious_activities?: number | null
          total_active_minutes?: number | null
          xp_earned?: number | null
        }
        Update: {
          date?: string
          days_completed?: number | null
          exercises_completed?: number | null
          exercises_started?: number | null
          first_activity?: string | null
          id?: string
          last_activity?: string | null
          login_count?: number | null
          player_id?: string
          suspicious_activities?: number | null
          total_active_minutes?: number | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_daily_summary_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_day_completions: {
        Row: {
          bonus_xp: number
          completed_at: string
          day_id: string
          id: string
          player_id: string
        }
        Insert: {
          bonus_xp?: number
          completed_at?: string
          day_id: string
          id?: string
          player_id: string
        }
        Update: {
          bonus_xp?: number
          completed_at?: string
          day_id?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_day_completions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_programs: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_active: boolean
          player_id: string
          program_id: string
          source: string | null
          started_at: string | null
          team_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          player_id: string
          program_id: string
          source?: string | null
          started_at?: string | null
          team_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          player_id?: string
          program_id?: string
          source?: string | null
          started_at?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_programs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_programs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_progress: {
        Row: {
          assigned_program_id: string
          completed: boolean
          completed_at: string | null
          day_id: string
          exercise_id: string
          id: string
          measurement_value: string | null
          notes: string | null
          player_id: string
        }
        Insert: {
          assigned_program_id: string
          completed?: boolean
          completed_at?: string | null
          day_id: string
          exercise_id: string
          id?: string
          measurement_value?: string | null
          notes?: string | null
          player_id: string
        }
        Update: {
          assigned_program_id?: string
          completed?: boolean
          completed_at?: string | null
          day_id?: string
          exercise_id?: string
          id?: string
          measurement_value?: string | null
          notes?: string | null
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_progress_assigned_program_id_fkey"
            columns: ["assigned_program_id"]
            isOneToOne: false
            referencedRelation: "assigned_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_progress_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_progress_v2: {
        Row: {
          completed_at: string | null
          created_at: string
          day_id: string
          exercise_id: string
          id: string
          is_completed: boolean
          measurement_value: string | null
          player_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_id: string
          exercise_id: string
          id?: string
          is_completed?: boolean
          measurement_value?: string | null
          player_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_id?: string
          exercise_id?: string
          id?: string
          is_completed?: boolean
          measurement_value?: string | null
          player_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_progress_v2_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_schedule_settings: {
        Row: {
          auto_schedule: boolean | null
          consider_recovery: boolean | null
          created_at: string | null
          has_team_training: boolean | null
          id: string
          match_day: number | null
          player_id: string
          preferred_duration: number | null
          preferred_time: string | null
          team_training_days: number[] | null
          training_days: number[] | null
          trainings_per_week: number | null
          updated_at: string | null
        }
        Insert: {
          auto_schedule?: boolean | null
          consider_recovery?: boolean | null
          created_at?: string | null
          has_team_training?: boolean | null
          id?: string
          match_day?: number | null
          player_id: string
          preferred_duration?: number | null
          preferred_time?: string | null
          team_training_days?: number[] | null
          training_days?: number[] | null
          trainings_per_week?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_schedule?: boolean | null
          consider_recovery?: boolean | null
          created_at?: string | null
          has_team_training?: boolean | null
          id?: string
          match_day?: number | null
          player_id?: string
          preferred_duration?: number | null
          preferred_time?: string | null
          team_training_days?: number[] | null
          training_days?: number[] | null
          trainings_per_week?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_schedule_settings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_sessions: {
        Row: {
          app_version: string | null
          device_type: string | null
          duration_seconds: number | null
          exercises_completed: number | null
          id: string
          is_active: boolean | null
          pages_visited: number | null
          player_id: string
          session_end: string | null
          session_start: string
        }
        Insert: {
          app_version?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          exercises_completed?: number | null
          id?: string
          is_active?: boolean | null
          pages_visited?: number | null
          player_id: string
          session_end?: string | null
          session_start?: string
        }
        Update: {
          app_version?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          exercises_completed?: number | null
          id?: string
          is_active?: boolean | null
          pages_visited?: number | null
          player_id?: string
          session_end?: string | null
          session_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          current_streak: number
          id: string
          last_training_date: string | null
          longest_streak: number
          player_id: string
          total_exercises: number
          total_training_minutes: number
          total_xp: number
        }
        Insert: {
          current_streak?: number
          id?: string
          last_training_date?: string | null
          longest_streak?: number
          player_id: string
          total_exercises?: number
          total_training_minutes?: number
          total_xp?: number
        }
        Update: {
          current_streak?: number
          id?: string
          last_training_date?: string | null
          longest_streak?: number
          player_id?: string
          total_exercises?: number
          total_training_minutes?: number
          total_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundles: {
        Row: {
          created_at: string
          id: string
          product_id: string
          program_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          program_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_bundles_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          billing_period: Database["public"]["Enums"]["billing_period"]
          created_at: string
          description_cs: string | null
          description_en: string | null
          description_uk: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          license_type: Database["public"]["Enums"]["license_type"]
          max_users: number | null
          name_cs: string | null
          name_en: string | null
          name_uk: string
          price_czk: number | null
          price_eur: number | null
          price_usd: number
          product_type: Database["public"]["Enums"]["product_type"]
          program_id: string | null
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          billing_period?: Database["public"]["Enums"]["billing_period"]
          created_at?: string
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          license_type?: Database["public"]["Enums"]["license_type"]
          max_users?: number | null
          name_cs?: string | null
          name_en?: string | null
          name_uk: string
          price_czk?: number | null
          price_eur?: number | null
          price_usd?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          program_id?: string | null
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          billing_period?: Database["public"]["Enums"]["billing_period"]
          created_at?: string
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          license_type?: Database["public"]["Enums"]["license_type"]
          max_users?: number | null
          name_cs?: string | null
          name_en?: string | null
          name_uk?: string
          price_czk?: number | null
          price_eur?: number | null
          price_usd?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          program_id?: string | null
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string
          fitness_level: number | null
          full_name: string
          height_cm: number | null
          id: string
          language: string
          max_trainings_per_week: number | null
          onboarding_completed: boolean | null
          position: Database["public"]["Enums"]["player_position"] | null
          preferred_training_time: string | null
          role: string
          show_in_leaderboard: boolean
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email: string
          fitness_level?: number | null
          full_name: string
          height_cm?: number | null
          id: string
          language?: string
          max_trainings_per_week?: number | null
          onboarding_completed?: boolean | null
          position?: Database["public"]["Enums"]["player_position"] | null
          preferred_training_time?: string | null
          role?: string
          show_in_leaderboard?: boolean
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          fitness_level?: number | null
          full_name?: string
          height_cm?: number | null
          id?: string
          language?: string
          max_trainings_per_week?: number | null
          onboarding_completed?: boolean | null
          position?: Database["public"]["Enums"]["player_position"] | null
          preferred_training_time?: string | null
          role?: string
          show_in_leaderboard?: boolean
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      program_days: {
        Row: {
          created_at: string
          day_number: number
          duration_minutes: number
          focus_cs: string | null
          focus_en: string | null
          focus_uk: string | null
          id: string
          intensity: string
          location: string
          program_id: string
          title_cs: string | null
          title_en: string | null
          title_uk: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_number: number
          duration_minutes?: number
          focus_cs?: string | null
          focus_en?: string | null
          focus_uk?: string | null
          id?: string
          intensity?: string
          location?: string
          program_id: string
          title_cs?: string | null
          title_en?: string | null
          title_uk: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          duration_minutes?: number
          focus_cs?: string | null
          focus_en?: string | null
          focus_uk?: string | null
          id?: string
          intensity?: string
          location?: string
          program_id?: string
          title_cs?: string | null
          title_en?: string | null
          title_uk?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_purchases: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string
          amount_paid: number
          created_at: string
          currency: string | null
          id: string
          product_id: string
          program_id: string
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string
          amount_paid: number
          created_at?: string
          currency?: string | null
          id?: string
          product_id: string
          program_id: string
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string
          amount_paid?: number
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string
          program_id?: string
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      program_requests: {
        Row: {
          admin_notes: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string
          created_by: string | null
          description_cs: string | null
          description_en: string | null
          description_uk: string | null
          difficulty: string
          duration_days: number
          icon: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          is_premium: boolean
          price_usd: number | null
          title_cs: string | null
          title_en: string | null
          title_uk: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          difficulty?: string
          duration_days?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_premium?: boolean
          price_usd?: number | null
          title_cs?: string | null
          title_en?: string | null
          title_uk: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          difficulty?: string
          duration_days?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_premium?: boolean
          price_usd?: number | null
          title_cs?: string | null
          title_en?: string | null
          title_uk?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_uses: {
        Row: {
          discount_applied: number | null
          id: string
          promo_code_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          discount_applied?: number | null
          id?: string
          promo_code_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          discount_applied?: number | null
          id?: string
          promo_code_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_uses_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_uses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applies_to_plans: string[] | null
          applies_to_products: string[] | null
          code: string
          created_at: string
          current_uses: number | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          max_uses_per_user: number | null
          stripe_coupon_id: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to_plans?: string[] | null
          applies_to_products?: string[] | null
          code: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          stripe_coupon_id?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applies_to_plans?: string[] | null
          applies_to_products?: string[] | null
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          stripe_coupon_id?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          player_id: string
          updated_at: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          player_id: string
          updated_at?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          player_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_changes: {
        Row: {
          calendar_entry_id: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_date: string
          old_date: string
          player_id: string
          reason: string | null
        }
        Insert: {
          calendar_entry_id: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_date: string
          old_date: string
          player_id: string
          reason?: string | null
        }
        Update: {
          calendar_entry_id?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_date?: string
          old_date?: string
          player_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_changes_calendar_entry_id_fkey"
            columns: ["calendar_entry_id"]
            isOneToOne: false
            referencedRelation: "player_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_changes_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_changes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          stripe_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description_cs: string | null
          description_en: string | null
          description_uk: string | null
          id: string
          included_programs: string[] | null
          includes_all_programs: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          license_type: Database["public"]["Enums"]["license_type"]
          max_teams: number | null
          max_users: number | null
          name_cs: string | null
          name_en: string | null
          name_uk: string
          price_monthly_czk: number | null
          price_monthly_eur: number | null
          price_monthly_usd: number
          price_yearly_czk: number | null
          price_yearly_eur: number | null
          price_yearly_usd: number | null
          sort_order: number | null
          stripe_price_monthly_id: string | null
          stripe_price_yearly_id: string | null
          stripe_product_id: string | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          included_programs?: string[] | null
          includes_all_programs?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          license_type?: Database["public"]["Enums"]["license_type"]
          max_teams?: number | null
          max_users?: number | null
          name_cs?: string | null
          name_en?: string | null
          name_uk: string
          price_monthly_czk?: number | null
          price_monthly_eur?: number | null
          price_monthly_usd: number
          price_yearly_czk?: number | null
          price_yearly_eur?: number | null
          price_yearly_usd?: number | null
          sort_order?: number | null
          stripe_price_monthly_id?: string | null
          stripe_price_yearly_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          included_programs?: string[] | null
          includes_all_programs?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          license_type?: Database["public"]["Enums"]["license_type"]
          max_teams?: number | null
          max_users?: number | null
          name_cs?: string | null
          name_en?: string | null
          name_uk?: string
          price_monthly_czk?: number | null
          price_monthly_eur?: number | null
          price_monthly_usd?: number
          price_yearly_czk?: number | null
          price_yearly_eur?: number | null
          price_yearly_usd?: number | null
          sort_order?: number | null
          stripe_price_monthly_id?: string | null
          stripe_price_yearly_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      team_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["training_day_type"]
          id: string
          intensity: Database["public"]["Enums"]["intensity_level"] | null
          is_cancelled: boolean | null
          location: string | null
          opponent: string | null
          start_time: string | null
          team_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["training_day_type"]
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          is_cancelled?: boolean | null
          location?: string | null
          opponent?: string | null
          start_time?: string | null
          team_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["training_day_type"]
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          is_cancelled?: boolean | null
          location?: string | null
          opponent?: string | null
          start_time?: string | null
          team_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          parent_id: string | null
          player_id: string
          role: string
          status: string
          team_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          parent_id?: string | null
          player_id: string
          role?: string
          status?: string
          team_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          parent_id?: string | null
          player_id?: string
          role?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_player_id_fkey"
            columns: ["player_id"]
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
      team_programs: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_active: boolean
          program_id: string
          team_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          program_id: string
          team_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          program_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_programs_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_programs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_schedule: {
        Row: {
          created_at: string | null
          created_by: string | null
          day_of_week: number
          description: string | null
          end_time: string | null
          event_type: Database["public"]["Enums"]["training_day_type"]
          id: string
          intensity: Database["public"]["Enums"]["intensity_level"] | null
          is_active: boolean | null
          location: string | null
          start_time: string
          team_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          day_of_week: number
          description?: string | null
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["training_day_type"]
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          is_active?: boolean | null
          location?: string | null
          start_time: string
          team_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          day_of_week?: number
          description?: string | null
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["training_day_type"]
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          is_active?: boolean | null
          location?: string | null
          start_time?: string
          team_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_schedule_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_schedule_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          coach_id: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          max_players: number | null
          product_id: string | null
          program_id: string
          status: string
          stripe_subscription_id: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          coach_id: string
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          max_players?: number | null
          product_id?: string | null
          program_id: string
          status?: string
          stripe_subscription_id?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          coach_id?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          max_players?: number | null
          product_id?: string | null
          program_id?: string
          status?: string
          stripe_subscription_id?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_subscriptions_team_id_fkey"
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
          code: string
          created_at: string
          id: string
          name: string
          settings: Json | null
        }
        Insert: {
          coach_id: string
          code: string
          created_at?: string
          id?: string
          name: string
          settings?: Json | null
        }
        Update: {
          coach_id?: string
          code?: string
          created_at?: string
          id?: string
          name?: string
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracker_connections: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_connected: boolean
          last_sync: string | null
          permissions: string[] | null
          player_id: string
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          permissions?: string[] | null
          player_id: string
          provider: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          permissions?: string[] | null
          player_id?: string
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracker_connections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          author_id: string
          created_at: string
          description: Json
          difficulty: string
          duration_weeks: number
          focus_areas: string[] | null
          id: string
          is_public: boolean
          title: Json
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description: Json
          difficulty?: string
          duration_weeks?: number
          focus_areas?: string[] | null
          id?: string
          is_public?: boolean
          title: Json
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: Json
          difficulty?: string
          duration_weeks?: number
          focus_areas?: string[] | null
          id?: string
          is_public?: boolean
          title?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_programs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_history: {
        Row: {
          converted_to_paid: boolean | null
          id: string
          product_id: string | null
          subscription_plan_id: string | null
          trial_ended_at: string | null
          trial_started_at: string
          user_id: string
        }
        Insert: {
          converted_to_paid?: boolean | null
          id?: string
          product_id?: string | null
          subscription_plan_id?: string | null
          trial_ended_at?: string | null
          trial_started_at?: string
          user_id: string
        }
        Update: {
          converted_to_paid?: boolean | null
          id?: string
          product_id?: string | null
          subscription_plan_id?: string | null
          trial_ended_at?: string | null
          trial_started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_history_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          billing_period: Database["public"]["Enums"]["billing_period"]
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          product_id: string | null
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_plan_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_period?: Database["public"]["Enums"]["billing_period"]
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          product_id?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_period?: Database["public"]["Enums"]["billing_period"]
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          product_id?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_templates: {
        Row: {
          age_category: string | null
          created_at: string | null
          description_cs: string | null
          description_en: string | null
          description_uk: string | null
          id: string
          is_system: boolean | null
          name_cs: string | null
          name_en: string | null
          name_uk: string
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          trainings_per_week: number
          week_structure: Json
        }
        Insert: {
          age_category?: string | null
          created_at?: string | null
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          is_system?: boolean | null
          name_cs?: string | null
          name_en?: string | null
          name_uk: string
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          trainings_per_week: number
          week_structure: Json
        }
        Update: {
          age_category?: string | null
          created_at?: string | null
          description_cs?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          is_system?: boolean | null
          name_cs?: string | null
          name_en?: string | null
          name_uk?: string
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          trainings_per_week?: number
          week_structure?: Json
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          created_at: string
          day_key: string | null
          distance_meters: number | null
          duration_seconds: number | null
          end_time: string | null
          heart_rate_avg: number | null
          heart_rate_data: number[] | null
          heart_rate_max: number | null
          id: string
          player_id: string
          program_id: string | null
          source: string
          start_time: string
          steps: number | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          day_key?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          end_time?: string | null
          heart_rate_avg?: number | null
          heart_rate_data?: number[] | null
          heart_rate_max?: number | null
          id?: string
          player_id: string
          program_id?: string | null
          source?: string
          start_time: string
          steps?: number | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          day_key?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          end_time?: string | null
          heart_rate_avg?: number | null
          heart_rate_data?: number[] | null
          heart_rate_max?: number | null
          id?: string
          player_id?: string
          program_id?: string | null
          source?: string
          start_time?: string
          steps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_start_trial: {
        Args: { p_plan_id?: string; p_product_id?: string; p_user_id: string }
        Returns: boolean
      }
      check_program_access: {
        Args: { p_program_id: string; p_user_id: string }
        Returns: {
          access_type: string
          access_until: string
          has_access: boolean
        }[]
      }
      check_team_player_limit: {
        Args: { p_program_id: string; p_team_id: string }
        Returns: {
          can_add_more: boolean
          current_players: number
          max_players: number
        }[]
      }
      generate_weekly_calendar: {
        Args: { p_player_id: string; p_start_date?: string }
        Returns: undefined
      }
      get_player_activity_detail: {
        Args: { p_days?: number; p_player_id: string }
        Returns: {
          activity_count: number
          activity_date: string
          activity_type: string
          total_duration_minutes: number
        }[]
      }
      get_recommended_day_type: {
        Args: { p_date: string; p_player_id: string }
        Returns: Database["public"]["Enums"]["training_day_type"]
      }
      get_team_activity_summary: {
        Args: { p_coach_id: string; p_days?: number }
        Returns: {
          avg_session_minutes: number
          last_active: string
          player_id: string
          player_name: string
          suspicious_count: number
          total_days_completed: number
          total_exercises: number
          total_logins: number
          total_xp: number
        }[]
      }
      get_weekly_fitness_summary: {
        Args: { p_player_id: string; p_week_start: string }
        Returns: {
          avg_heart_rate: number
          total_active_minutes: number
          total_calories: number
          total_distance: number
          total_steps: number
          total_workout_duration: number
          workout_count: number
        }[]
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      reschedule_training: {
        Args: {
          p_calendar_id: string
          p_changed_by?: string
          p_new_date: string
          p_reason?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      billing_period: "monthly" | "yearly" | "lifetime"
      intensity_level: "very_low" | "low" | "medium" | "high" | "very_high"
      license_type: "individual" | "team"
      player_position:
        | "goalkeeper"
        | "defender"
        | "midfielder"
        | "forward"
        | "universal"
      product_type: "program" | "bundle" | "subscription_plan"
      skill_level: "beginner" | "intermediate" | "advanced"
      training_day_type:
        | "full_training"
        | "light_training"
        | "skills_only"
        | "recovery"
        | "match_prep"
        | "post_match"
        | "team_training"
        | "match_day"
        | "rest"
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
      billing_period: ["monthly", "yearly", "lifetime"],
      intensity_level: ["very_low", "low", "medium", "high", "very_high"],
      license_type: ["individual", "team"],
      player_position: [
        "goalkeeper",
        "defender",
        "midfielder",
        "forward",
        "universal",
      ],
      product_type: ["program", "bundle", "subscription_plan"],
      skill_level: ["beginner", "intermediate", "advanced"],
      training_day_type: [
        "full_training",
        "light_training",
        "skills_only",
        "recovery",
        "match_prep",
        "post_match",
        "team_training",
        "match_day",
        "rest",
      ],
    },
  },
} as const
