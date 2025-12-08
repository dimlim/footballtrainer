// Re-export auto-generated Supabase types
export type { Database, Json } from './supabase';
import type { Database } from './supabase';

// Custom type aliases for easier usage
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

// Table types - extracted from generated Database type
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Profile types
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Team types
export type Team = Tables['teams']['Row'];
export type TeamInsert = Tables['teams']['Insert'];
export type TeamUpdate = Tables['teams']['Update'];

// Team member types
export type TeamMember = Tables['team_members']['Row'];
export type TeamMemberInsert = Tables['team_members']['Insert'];
export type TeamMemberUpdate = Tables['team_members']['Update'];

// Program types (from new schema)
export type Program = Tables['programs']['Row'];
export type ProgramInsert = Tables['programs']['Insert'];
export type ProgramUpdate = Tables['programs']['Update'];

// Program day types
export type ProgramDay = Tables['program_days']['Row'];
export type ProgramDayInsert = Tables['program_days']['Insert'];
export type ProgramDayUpdate = Tables['program_days']['Update'];

// Day section types
export type DaySection = Tables['day_sections']['Row'];
export type DaySectionInsert = Tables['day_sections']['Insert'];
export type DaySectionUpdate = Tables['day_sections']['Update'];

// Exercise types
export type Exercise = Tables['exercises']['Row'];
export type ExerciseInsert = Tables['exercises']['Insert'];
export type ExerciseUpdate = Tables['exercises']['Update'];

// Player program types
export type PlayerProgram = Tables['player_programs']['Row'];
export type PlayerProgramInsert = Tables['player_programs']['Insert'];
export type PlayerProgramUpdate = Tables['player_programs']['Update'];

// Player progress types
export type PlayerProgressV2 = Tables['player_progress_v2']['Row'];
export type PlayerProgressV2Insert = Tables['player_progress_v2']['Insert'];
export type PlayerProgressV2Update = Tables['player_progress_v2']['Update'];

// Player day completion types
export type PlayerDayCompletion = Tables['player_day_completions']['Row'];
export type PlayerDayCompletionInsert = Tables['player_day_completions']['Insert'];
export type PlayerDayCompletionUpdate = Tables['player_day_completions']['Update'];

// Achievement types
export type Achievement = Tables['achievements']['Row'];
export type AchievementInsert = Tables['achievements']['Insert'];
export type AchievementUpdate = Tables['achievements']['Update'];

// Player achievement types
export type PlayerAchievement = Tables['player_achievements']['Row'];
export type PlayerAchievementInsert = Tables['player_achievements']['Insert'];
export type PlayerAchievementUpdate = Tables['player_achievements']['Update'];

// Player stats types
export type PlayerStats = Tables['player_stats']['Row'];
export type PlayerStatsInsert = Tables['player_stats']['Insert'];
export type PlayerStatsUpdate = Tables['player_stats']['Update'];

// Schedule types
export type PlayerScheduleSettings = Tables['player_schedule_settings']['Row'];
export type PlayerScheduleSettingsInsert = Tables['player_schedule_settings']['Insert'];
export type PlayerScheduleSettingsUpdate = Tables['player_schedule_settings']['Update'];

export type TeamSchedule = Tables['team_schedule']['Row'];
export type TeamScheduleInsert = Tables['team_schedule']['Insert'];
export type TeamScheduleUpdate = Tables['team_schedule']['Update'];

export type TeamEvent = Tables['team_events']['Row'];
export type TeamEventInsert = Tables['team_events']['Insert'];
export type TeamEventUpdate = Tables['team_events']['Update'];

export type PlayerCalendar = Tables['player_calendar']['Row'];
export type PlayerCalendarInsert = Tables['player_calendar']['Insert'];
export type PlayerCalendarUpdate = Tables['player_calendar']['Update'];

// Activity logging types
export type PlayerActivityLog = Tables['player_activity_log']['Row'];
export type PlayerSession = Tables['player_sessions']['Row'];
export type ExerciseTiming = Tables['exercise_timing']['Row'];
export type PlayerDailySummary = Tables['player_daily_summary']['Row'];

// Notification types
export type PushSubscription = Tables['push_subscriptions']['Row'];
export type NotificationPreference = Tables['notification_preferences']['Row'];
export type NotificationHistory = Tables['notification_history']['Row'];

// Subscription types
export type Product = Tables['products']['Row'];
export type SubscriptionPlan = Tables['subscription_plans']['Row'];
export type UserSubscription = Tables['user_subscriptions']['Row'];
export type TeamSubscription = Tables['team_subscriptions']['Row'];

// Legacy types for backward compatibility
export type TrainingProgram = Tables['training_programs']['Row'];
export type AssignedProgram = Tables['assigned_programs']['Row'];
export type PlayerProgress = Tables['player_progress']['Row'];
