import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface PlayerProgram {
  id: string;
  player_id: string;
  program_id: string;
  started_at: string; // Date string YYYY-MM-DD
  completed_at?: string;
  is_active: boolean;
  created_at: string;
}

interface PlayerProgramState {
  playerPrograms: Record<string, PlayerProgram>; // program_id -> PlayerProgram
  isLoading: boolean;
  
  // Actions
  loadPlayerPrograms: (playerId: string) => Promise<void>;
  addProgram: (playerId: string, programId: string) => Promise<PlayerProgram | null>;
  removeProgram: (playerId: string, programId: string) => Promise<void>;
  startProgram: (playerId: string, programId: string, startDate?: Date) => Promise<PlayerProgram | null>;
  completeProgram: (playerId: string, programId: string) => Promise<void>;
  getPlayerProgram: (programId: string) => PlayerProgram | undefined;
  hasProgram: (programId: string) => boolean;
  getProgramStartDate: (programId: string) => Date | null;
  getDayNumberForDate: (programId: string, date: Date) => number | null;
  getDateForDayNumber: (programId: string, dayNumber: number) => Date | null;
  isDateInProgram: (programId: string, date: Date, totalDays: number) => boolean;
}

export const usePlayerProgramStore = create<PlayerProgramState>((set, get) => ({
  playerPrograms: {},
  isLoading: false,

  loadPlayerPrograms: async (playerId: string) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('player_programs')
        .select('*')
        .eq('player_id', playerId);

      if (error) {
        console.error('Error loading player programs:', error);
        set({ isLoading: false });
        return;
      }

      const programs: Record<string, PlayerProgram> = {};
      data?.forEach(p => {
        programs[p.program_id] = p;
      });

      set({ playerPrograms: programs, isLoading: false });
    } catch (error) {
      console.error('Error loading player programs:', error);
      set({ isLoading: false });
    }
  },

  // Add program to user's list (without starting it)
  addProgram: async (playerId: string, programId: string) => {
    try {
      const { data, error } = await supabase
        .from('player_programs')
        .insert({
          player_id: playerId,
          program_id: programId,
          is_active: true,
          started_at: null, // Not started yet
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding program:', error);
        return null;
      }

      set((state) => ({
        playerPrograms: {
          ...state.playerPrograms,
          [programId]: data,
        },
      }));

      return data;
    } catch (error) {
      console.error('Error adding program:', error);
      return null;
    }
  },

  // Remove program from user's list
  removeProgram: async (playerId: string, programId: string) => {
    try {
      const { error } = await supabase
        .from('player_programs')
        .delete()
        .eq('player_id', playerId)
        .eq('program_id', programId);

      if (error) {
        console.error('Error removing program:', error);
        return;
      }

      set((state) => {
        const newPrograms = { ...state.playerPrograms };
        delete newPrograms[programId];
        return { playerPrograms: newPrograms };
      });
    } catch (error) {
      console.error('Error removing program:', error);
    }
  },

  startProgram: async (playerId: string, programId: string, startDate?: Date) => {
    const dateStr = (startDate || new Date()).toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('player_programs')
        .upsert({
          player_id: playerId,
          program_id: programId,
          started_at: dateStr,
          is_active: true,
          completed_at: null,
        }, {
          onConflict: 'player_id,program_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting program:', error);
        return null;
      }

      set((state) => ({
        playerPrograms: {
          ...state.playerPrograms,
          [programId]: data,
        },
      }));

      return data;
    } catch (error) {
      console.error('Error starting program:', error);
      return null;
    }
  },

  completeProgram: async (playerId: string, programId: string) => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('player_programs')
        .update({
          completed_at: dateStr,
          is_active: false,
        })
        .eq('player_id', playerId)
        .eq('program_id', programId);

      if (error) {
        console.error('Error completing program:', error);
        return;
      }

      set((state) => ({
        playerPrograms: {
          ...state.playerPrograms,
          [programId]: {
            ...state.playerPrograms[programId],
            completed_at: dateStr,
            is_active: false,
          },
        },
      }));
    } catch (error) {
      console.error('Error completing program:', error);
    }
  },

  getPlayerProgram: (programId: string) => {
    return get().playerPrograms[programId];
  },

  hasProgram: (programId: string) => {
    return !!get().playerPrograms[programId];
  },

  getProgramStartDate: (programId: string) => {
    const program = get().playerPrograms[programId];
    if (!program) return null;
    return new Date(program.started_at + 'T00:00:00');
  },

  // Get day number (1-30) for a specific calendar date
  getDayNumberForDate: (programId: string, date: Date) => {
    const startDate = get().getProgramStartDate(programId);
    if (!startDate) return null;

    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Day 1 = start date, Day 2 = start date + 1, etc.
    return diffDays + 1;
  },

  // Get calendar date for a specific day number
  getDateForDayNumber: (programId: string, dayNumber: number) => {
    const startDate = get().getProgramStartDate(programId);
    if (!startDate) return null;

    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date;
  },

  // Check if a date falls within the program duration
  isDateInProgram: (programId: string, date: Date, totalDays: number) => {
    const dayNumber = get().getDayNumberForDate(programId, date);
    if (dayNumber === null) return false;
    return dayNumber >= 1 && dayNumber <= totalDays;
  },
}));

