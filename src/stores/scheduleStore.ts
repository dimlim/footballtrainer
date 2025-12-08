// @ts-nocheck
// TODO: Remove @ts-nocheck after running supabase/training-schedule.sql
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { 
  PlayerScheduleSettings, 
  TeamSchedule, 
  TeamEvent, 
  PlayerCalendarEntry,
  WeeklyTemplate,
  TrainingDayType,
  DayOfWeek,
  IntensityLevel,
  needsRecoveryAfter,
  isHighIntensity
} from '@/types/schedule';
import { format, addDays, parseISO } from 'date-fns';

interface ScheduleState {
  // Налаштування гравця
  settings: PlayerScheduleSettings | null;
  
  // Командний розклад
  teamSchedule: TeamSchedule[];
  teamEvents: TeamEvent[];
  
  // Календар гравця
  calendar: PlayerCalendarEntry[];
  
  // Шаблони
  templates: WeeklyTemplate[];
  
  // Стан
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: (playerId: string) => Promise<void>;
  saveSettings: (settings: Partial<PlayerScheduleSettings>) => Promise<void>;
  loadTeamSchedule: (teamId: string) => Promise<void>;
  loadTeamEvents: (teamId: string, startDate?: Date, endDate?: Date) => Promise<void>;
  loadCalendar: (playerId: string, startDate: Date, endDate: Date) => Promise<void>;
  loadTemplates: () => Promise<void>;
  
  // Генерація календаря
  generateCalendar: (playerId: string, startDate: Date, programId?: string) => Promise<void>;
  
  // Перенесення тренування
  rescheduleTraining: (entryId: string, newDate: Date, reason?: string) => Promise<boolean>;
  
  // Позначення як виконано/пропущено
  markAsCompleted: (entryId: string) => Promise<void>;
  markAsSkipped: (entryId: string, reason?: string) => Promise<void>;
  
  // Командний розклад (для тренера)
  addTeamScheduleEntry: (entry: Partial<TeamSchedule>) => Promise<void>;
  updateTeamScheduleEntry: (id: string, entry: Partial<TeamSchedule>) => Promise<void>;
  deleteTeamScheduleEntry: (id: string) => Promise<void>;
  
  // Командні події (для тренера)
  addTeamEvent: (event: Partial<TeamEvent>) => Promise<void>;
  updateTeamEvent: (id: string, event: Partial<TeamEvent>) => Promise<void>;
  deleteTeamEvent: (id: string) => Promise<void>;
  
  // Утиліти
  getRecommendedDayType: (date: Date) => TrainingDayType;
  getCalendarForDate: (date: Date) => PlayerCalendarEntry | undefined;
  getWeekCalendar: (weekStart: Date) => PlayerCalendarEntry[];
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  settings: null,
  teamSchedule: [],
  teamEvents: [],
  calendar: [],
  templates: [],
  isLoading: false,
  error: null,
  
  loadSettings: async (playerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await (supabase
        .from('player_schedule_settings') as any)
        .select('*')
        .eq('player_id', playerId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        set({ settings: data as PlayerScheduleSettings });
      } else {
        // Створюємо налаштування за замовчуванням
        const defaultSettings: Partial<PlayerScheduleSettings> = {
          player_id: playerId,
          training_days: [1, 3, 5], // Пн, Ср, Пт
          trainings_per_week: 3,
          has_team_training: false,
          team_training_days: [],
          match_day: null,
          preferred_time: '18:00',
          preferred_duration: 45,
          auto_schedule: true,
          consider_recovery: true
        };
        
        const { data: newSettings, error: insertError } = await (supabase
          .from('player_schedule_settings') as any)
          .insert(defaultSettings)
          .select()
          .single();
        
        if (insertError) throw insertError;
        set({ settings: newSettings as PlayerScheduleSettings });
      }
    } catch (error) {
      console.error('Error loading schedule settings:', error);
      set({ error: 'Помилка завантаження налаштувань розкладу' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveSettings: async (updates: Partial<PlayerScheduleSettings>) => {
    const { settings } = get();
    if (!settings) return;
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await (supabase
        .from('player_schedule_settings') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) throw error;
      set({ settings: data as PlayerScheduleSettings });
    } catch (error) {
      console.error('Error saving schedule settings:', error);
      set({ error: 'Помилка збереження налаштувань' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadTeamSchedule: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_schedule')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('day_of_week');
      
      if (error) throw error;
      set({ teamSchedule: (data || []) as TeamSchedule[] });
    } catch (error) {
      console.error('Error loading team schedule:', error);
    }
  },
  
  loadTeamEvents: async (teamId: string, startDate?: Date, endDate?: Date) => {
    try {
      let query = supabase
        .from('team_events')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_cancelled', false)
        .order('event_date');
      
      if (startDate) {
        query = query.gte('event_date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('event_date', format(endDate, 'yyyy-MM-dd'));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      set({ teamEvents: (data || []) as TeamEvent[] });
    } catch (error) {
      console.error('Error loading team events:', error);
    }
  },
  
  loadCalendar: async (playerId: string, startDate: Date, endDate: Date) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('player_calendar')
        .select('*')
        .eq('player_id', playerId)
        .gte('calendar_date', format(startDate, 'yyyy-MM-dd'))
        .lte('calendar_date', format(endDate, 'yyyy-MM-dd'))
        .order('calendar_date');
      
      if (error) throw error;
      set({ calendar: (data || []) as PlayerCalendarEntry[] });
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadTemplates: async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_templates')
        .select('*')
        .order('trainings_per_week');
      
      if (error) throw error;
      set({ templates: (data || []) as WeeklyTemplate[] });
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  },
  
  generateCalendar: async (playerId: string, startDate: Date, programId?: string) => {
    const { settings, teamSchedule, teamEvents } = get();
    if (!settings) return;
    
    set({ isLoading: true, error: null });
    try {
      const entries: Partial<PlayerCalendarEntry>[] = [];
      let programDayIndex = 0;
      
      // Генеруємо на 4 тижні вперед
      for (let i = 0; i < 28; i++) {
        const date = addDays(startDate, i);
        const dayOfWeek = date.getDay() as DayOfWeek;
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Перевіряємо чи є командна подія
        const teamEvent = teamEvents.find(e => e.event_date === dateStr);
        if (teamEvent) {
          entries.push({
            player_id: playerId,
            calendar_date: dateStr,
            day_type: teamEvent.event_type,
            team_event_id: teamEvent.id,
            title: teamEvent.title,
            description: teamEvent.description,
            scheduled_time: teamEvent.start_time,
            intensity: teamEvent.intensity
          });
          continue;
        }
        
        // Перевіряємо командний розклад
        const teamTraining = teamSchedule.find(s => s.day_of_week === dayOfWeek);
        if (teamTraining) {
          entries.push({
            player_id: playerId,
            calendar_date: dateStr,
            day_type: 'team_training',
            team_schedule_id: teamTraining.id,
            title: teamTraining.title || 'Командне тренування',
            scheduled_time: teamTraining.start_time,
            intensity: teamTraining.intensity
          });
          continue;
        }
        
        // Перевіряємо чи це день матчу
        if (settings.match_day === dayOfWeek) {
          entries.push({
            player_id: playerId,
            calendar_date: dateStr,
            day_type: 'match_day',
            title: 'День матчу',
            intensity: 'very_high'
          });
          continue;
        }
        
        // Перевіряємо чи це тренувальний день
        if (settings.training_days.includes(dayOfWeek)) {
          // Визначаємо тип дня з урахуванням попереднього
          const prevEntry = entries[entries.length - 1];
          let dayType: TrainingDayType = 'full_training';
          let intensity: IntensityLevel = 'medium';
          
          if (prevEntry && needsRecoveryAfter(prevEntry.day_type as TrainingDayType)) {
            if (settings.consider_recovery) {
              dayType = 'light_training';
              intensity = 'low';
            }
          }
          
          // Перевіряємо чи завтра матч
          const tomorrow = addDays(date, 1);
          const tomorrowDayOfWeek = tomorrow.getDay() as DayOfWeek;
          if (settings.match_day === tomorrowDayOfWeek) {
            dayType = 'match_prep';
            intensity = 'medium';
          }
          
          entries.push({
            player_id: playerId,
            calendar_date: dateStr,
            day_type: dayType,
            program_id: programId,
            scheduled_time: settings.preferred_time,
            duration_minutes: settings.preferred_duration,
            intensity
          });
          
          programDayIndex++;
        } else {
          // День відпочинку
          entries.push({
            player_id: playerId,
            calendar_date: dateStr,
            day_type: 'rest',
            intensity: 'very_low'
          });
        }
      }
      
      // Зберігаємо в БД
      const { error } = await supabase
        .from('player_calendar')
        .upsert(entries, { 
          onConflict: 'player_id,calendar_date,day_type',
          ignoreDuplicates: true 
        });
      
      if (error) throw error;
      
      // Перезавантажуємо календар
      await get().loadCalendar(playerId, startDate, addDays(startDate, 28));
      
    } catch (error) {
      console.error('Error generating calendar:', error);
      set({ error: 'Помилка генерації календаря' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  rescheduleTraining: async (entryId: string, newDate: Date, reason?: string) => {
    const { calendar } = get();
    const entry = calendar.find(e => e.id === entryId);
    if (!entry) return false;
    
    try {
      // Перевіряємо чи нова дата вільна
      const newDateStr = format(newDate, 'yyyy-MM-dd');
      const existingEntry = calendar.find(
        e => e.calendar_date === newDateStr && e.day_type !== 'rest'
      );
      
      if (existingEntry) {
        set({ error: 'На цю дату вже заплановано тренування' });
        return false;
      }
      
      // Зберігаємо історію зміни
      await supabase
        .from('schedule_changes')
        .insert({
          player_id: entry.player_id,
          calendar_entry_id: entryId,
          old_date: entry.calendar_date,
          new_date: newDateStr,
          reason
        });
      
      // Оновлюємо запис
      const { error } = await supabase
        .from('player_calendar')
        .update({
          calendar_date: newDateStr,
          is_rescheduled: true,
          original_date: entry.calendar_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);
      
      if (error) throw error;
      
      // Оновлюємо локальний стан
      set({
        calendar: calendar.map(e => 
          e.id === entryId 
            ? { ...e, calendar_date: newDateStr, is_rescheduled: true, original_date: entry.calendar_date }
            : e
        )
      });
      
      return true;
    } catch (error) {
      console.error('Error rescheduling training:', error);
      set({ error: 'Помилка перенесення тренування' });
      return false;
    }
  },
  
  markAsCompleted: async (entryId: string) => {
    const { calendar } = get();
    
    try {
      const { error } = await supabase
        .from('player_calendar')
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);
      
      if (error) throw error;
      
      set({
        calendar: calendar.map(e => 
          e.id === entryId ? { ...e, is_completed: true } : e
        )
      });
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  },
  
  markAsSkipped: async (entryId: string, reason?: string) => {
    const { calendar } = get();
    
    try {
      const { error } = await supabase
        .from('player_calendar')
        .update({ 
          is_skipped: true,
          player_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);
      
      if (error) throw error;
      
      set({
        calendar: calendar.map(e => 
          e.id === entryId ? { ...e, is_skipped: true, player_notes: reason } : e
        )
      });
    } catch (error) {
      console.error('Error marking as skipped:', error);
    }
  },
  
  addTeamScheduleEntry: async (entry: Partial<TeamSchedule>) => {
    try {
      const { data, error } = await supabase
        .from('team_schedule')
        .insert(entry)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        teamSchedule: [...state.teamSchedule, data as TeamSchedule]
      }));
    } catch (error) {
      console.error('Error adding team schedule:', error);
      set({ error: 'Помилка додавання розкладу команди' });
    }
  },
  
  updateTeamScheduleEntry: async (id: string, entry: Partial<TeamSchedule>) => {
    try {
      const { data, error } = await supabase
        .from('team_schedule')
        .update({ ...entry, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        teamSchedule: state.teamSchedule.map(s => s.id === id ? data as TeamSchedule : s)
      }));
    } catch (error) {
      console.error('Error updating team schedule:', error);
    }
  },
  
  deleteTeamScheduleEntry: async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_schedule')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        teamSchedule: state.teamSchedule.filter(s => s.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting team schedule:', error);
    }
  },
  
  addTeamEvent: async (event: Partial<TeamEvent>) => {
    try {
      const { data, error } = await supabase
        .from('team_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        teamEvents: [...state.teamEvents, data as TeamEvent]
      }));
    } catch (error) {
      console.error('Error adding team event:', error);
      set({ error: 'Помилка додавання події' });
    }
  },
  
  updateTeamEvent: async (id: string, event: Partial<TeamEvent>) => {
    try {
      const { data, error } = await supabase
        .from('team_events')
        .update({ ...event, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        teamEvents: state.teamEvents.map(e => e.id === id ? data as TeamEvent : e)
      }));
    } catch (error) {
      console.error('Error updating team event:', error);
    }
  },
  
  deleteTeamEvent: async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        teamEvents: state.teamEvents.filter(e => e.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting team event:', error);
    }
  },
  
  getRecommendedDayType: (date: Date): TrainingDayType => {
    const { settings, calendar, teamSchedule, teamEvents } = get();
    const dayOfWeek = date.getDay() as DayOfWeek;
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Перевіряємо командні події
    const teamEvent = teamEvents.find(e => e.event_date === dateStr);
    if (teamEvent) return teamEvent.event_type;
    
    // Перевіряємо командний розклад
    const teamTraining = teamSchedule.find(s => s.day_of_week === dayOfWeek);
    if (teamTraining) return 'team_training';
    
    // Перевіряємо день матчу
    if (settings?.match_day === dayOfWeek) return 'match_day';
    
    // Перевіряємо чи це тренувальний день
    if (settings?.training_days.includes(dayOfWeek)) {
      // Перевіряємо попередній день
      const yesterday = addDays(date, -1);
      const yesterdayEntry = calendar.find(e => 
        e.calendar_date === format(yesterday, 'yyyy-MM-dd')
      );
      
      if (yesterdayEntry && isHighIntensity(yesterdayEntry.day_type)) {
        return 'light_training';
      }
      
      // Перевіряємо чи завтра матч
      const tomorrow = addDays(date, 1);
      if (settings.match_day === tomorrow.getDay()) {
        return 'match_prep';
      }
      
      return 'full_training';
    }
    
    return 'rest';
  },
  
  getCalendarForDate: (date: Date): PlayerCalendarEntry | undefined => {
    const { calendar } = get();
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendar.find(e => e.calendar_date === dateStr);
  },
  
  getWeekCalendar: (weekStart: Date): PlayerCalendarEntry[] => {
    const { calendar } = get();
    const weekEnd = addDays(weekStart, 6);
    
    return calendar.filter(e => {
      const entryDate = parseISO(e.calendar_date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
  }
}));

