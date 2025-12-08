export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'player' | 'parent' | 'coach';
export type Language = 'uk' | 'en' | 'cs';
export type Intensity = 'low' | 'medium' | 'high';
export type Location = 'home' | 'field' | 'gym';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'checkbox' | 'input' | 'timer';
export type ProgramStatus = 'active' | 'paused' | 'completed';
export type TeamMemberRole = 'player' | 'assistant';
export type TeamMemberStatus = 'active' | 'inactive' | 'pending';
export type AgeCategory = 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'Senior';

// Localized content type
export interface LocalizedText {
  uk: string;
  en: string;
  cs: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: UserRole;
          language: Language;
          show_in_leaderboard: boolean;
          onboarding_completed: boolean;
          birth_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: UserRole;
          language?: Language;
          show_in_leaderboard?: boolean;
          onboarding_completed?: boolean;
          birth_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          language?: Language;
          show_in_leaderboard?: boolean;
          onboarding_completed?: boolean;
          birth_date?: string | null;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          code: string;
          coach_id: string;
          created_at: string;
          settings: Json;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          coach_id: string;
          created_at?: string;
          settings?: Json;
        };
        Update: {
          name?: string;
          code?: string;
          settings?: Json;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          player_id: string;
          parent_id: string | null;
          role: TeamMemberRole;
          joined_at: string;
          status: TeamMemberStatus;
        };
        Insert: {
          id?: string;
          team_id: string;
          player_id: string;
          parent_id?: string | null;
          role?: TeamMemberRole;
          joined_at?: string;
          status?: TeamMemberStatus;
        };
        Update: {
          role?: TeamMemberRole;
          status?: TeamMemberStatus;
          parent_id?: string | null;
        };
      };
      training_programs: {
        Row: {
          id: string;
          title: LocalizedText;
          description: LocalizedText;
          author_id: string;
          is_public: boolean;
          difficulty: Difficulty;
          duration_weeks: number;
          focus_areas: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: LocalizedText;
          description: LocalizedText;
          author_id: string;
          is_public?: boolean;
          difficulty?: Difficulty;
          duration_weeks?: number;
          focus_areas?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: LocalizedText;
          description?: LocalizedText;
          is_public?: boolean;
          difficulty?: Difficulty;
          duration_weeks?: number;
          focus_areas?: string[];
          updated_at?: string;
        };
      };
      program_days: {
        Row: {
          id: string;
          program_id: string;
          day_number: number;
          title: LocalizedText;
          intensity: Intensity;
          location: Location;
          duration_minutes: number;
          focus: LocalizedText;
          order_index: number;
        };
        Insert: {
          id?: string;
          program_id: string;
          day_number: number;
          title: LocalizedText;
          intensity?: Intensity;
          location?: Location;
          duration_minutes?: number;
          focus: LocalizedText;
          order_index?: number;
        };
        Update: {
          day_number?: number;
          title?: LocalizedText;
          intensity?: Intensity;
          location?: Location;
          duration_minutes?: number;
          focus?: LocalizedText;
          order_index?: number;
        };
      };
      day_sections: {
        Row: {
          id: string;
          day_id: string;
          title: LocalizedText;
          duration_minutes: number | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          day_id: string;
          title: LocalizedText;
          duration_minutes?: number | null;
          order_index?: number;
        };
        Update: {
          title?: LocalizedText;
          duration_minutes?: number | null;
          order_index?: number;
        };
      };
      exercises: {
        Row: {
          id: string;
          section_id: string;
          title: LocalizedText;
          description: LocalizedText | null;
          sets: string | null;
          reps: string | null;
          rest_seconds: number | null;
          type: ExerciseType;
          input_label: LocalizedText | null;
          note: LocalizedText | null;
          timer_duration: number | null;
          video_url: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: LocalizedText;
          description?: LocalizedText | null;
          sets?: string | null;
          reps?: string | null;
          rest_seconds?: number | null;
          type?: ExerciseType;
          input_label?: LocalizedText | null;
          note?: LocalizedText | null;
          timer_duration?: number | null;
          video_url?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          title?: LocalizedText;
          description?: LocalizedText | null;
          sets?: string | null;
          reps?: string | null;
          rest_seconds?: number | null;
          type?: ExerciseType;
          input_label?: LocalizedText | null;
          note?: LocalizedText | null;
          timer_duration?: number | null;
          video_url?: string | null;
          order_index?: number;
        };
      };
      assigned_programs: {
        Row: {
          id: string;
          program_id: string;
          player_id: string;
          assigned_by: string;
          start_date: string;
          status: ProgramStatus;
          schedule: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          player_id: string;
          assigned_by: string;
          start_date: string;
          status?: ProgramStatus;
          schedule?: Json;
          created_at?: string;
        };
        Update: {
          start_date?: string;
          status?: ProgramStatus;
          schedule?: Json;
        };
      };
      player_progress: {
        Row: {
          id: string;
          player_id: string;
          assigned_program_id: string;
          day_id: string;
          exercise_id: string;
          completed: boolean;
          measurement_value: string | null;
          completed_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          player_id: string;
          assigned_program_id: string;
          day_id: string;
          exercise_id: string;
          completed?: boolean;
          measurement_value?: string | null;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: {
          completed?: boolean;
          measurement_value?: string | null;
          completed_at?: string | null;
          notes?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          title: LocalizedText;
          description: LocalizedText;
          icon: string;
          condition_type: string;
          condition_value: number;
          xp_reward: number;
        };
        Insert: {
          id?: string;
          title: LocalizedText;
          description: LocalizedText;
          icon: string;
          condition_type: string;
          condition_value: number;
          xp_reward?: number;
        };
        Update: {
          title?: LocalizedText;
          description?: LocalizedText;
          icon?: string;
          condition_type?: string;
          condition_value?: number;
          xp_reward?: number;
        };
      };
      player_achievements: {
        Row: {
          id: string;
          player_id: string;
          achievement_id: string;
          earned_at: string;
          notified: boolean;
        };
        Insert: {
          id?: string;
          player_id: string;
          achievement_id: string;
          earned_at?: string;
          notified?: boolean;
        };
        Update: {
          notified?: boolean;
        };
      };
      player_stats: {
        Row: {
          id: string;
          player_id: string;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          total_exercises: number;
          total_training_minutes: number;
          last_training_date: string | null;
        };
        Insert: {
          id?: string;
          player_id: string;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          total_exercises?: number;
          total_training_minutes?: number;
          last_training_date?: string | null;
        };
        Update: {
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          total_exercises?: number;
          total_training_minutes?: number;
          last_training_date?: string | null;
        };
      };
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type TrainingProgram = Database['public']['Tables']['training_programs']['Row'];
export type ProgramDay = Database['public']['Tables']['program_days']['Row'];
export type DaySection = Database['public']['Tables']['day_sections']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type AssignedProgram = Database['public']['Tables']['assigned_programs']['Row'];
export type PlayerProgress = Database['public']['Tables']['player_progress']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type PlayerAchievement = Database['public']['Tables']['player_achievements']['Row'];
export type PlayerStats = Database['public']['Tables']['player_stats']['Row'];

