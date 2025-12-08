// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Types for custom programs
export interface CustomProgram {
  id: string;
  coach_id: string;
  title_uk: string;
  title_en?: string;
  title_cs?: string;
  description_uk?: string;
  description_en?: string;
  description_cs?: string;
  category: string;
  difficulty: string;
  duration_days: number;
  icon: string;
  cover_image?: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomProgramDay {
  id: string;
  program_id: string;
  day_number: number;
  title_uk: string;
  title_en?: string;
  title_cs?: string;
  focus_uk?: string;
  focus_en?: string;
  focus_cs?: string;
  intensity: string;
  location: string;
  duration_minutes: number;
}

export interface CustomDaySection {
  id: string;
  day_id: string;
  order_index: number;
  title_uk: string;
  title_en?: string;
  title_cs?: string;
  duration_minutes?: number;
}

export interface CustomExercise {
  id: string;
  section_id: string;
  order_index: number;
  title_uk: string;
  title_en?: string;
  title_cs?: string;
  description_uk?: string[];
  description_en?: string[];
  description_cs?: string[];
  sets_uk?: string;
  sets_en?: string;
  sets_cs?: string;
  reps_uk?: string;
  reps_en?: string;
  reps_cs?: string;
  rest_seconds?: number;
  exercise_type: string;
  input_label_uk?: string;
  input_label_en?: string;
  input_label_cs?: string;
  note_uk?: string;
  note_en?: string;
  note_cs?: string;
  timer_duration?: number;
  video_url?: string;
}

interface CoachProgramState {
  programs: CustomProgram[];
  currentProgram: CustomProgram | null;
  currentDays: CustomProgramDay[];
  currentSections: Record<string, CustomDaySection[]>; // day_id -> sections
  currentExercises: Record<string, CustomExercise[]>; // section_id -> exercises
  isLoading: boolean;
  error: string | null;

  // Program actions
  loadCoachPrograms: (coachId: string) => Promise<void>;
  createProgram: (program: Partial<CustomProgram>) => Promise<CustomProgram | null>;
  updateProgram: (id: string, updates: Partial<CustomProgram>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  loadProgramDetails: (programId: string) => Promise<void>;

  // Day actions
  createDay: (day: Partial<CustomProgramDay>) => Promise<CustomProgramDay | null>;
  updateDay: (id: string, updates: Partial<CustomProgramDay>) => Promise<void>;
  deleteDay: (id: string) => Promise<void>;

  // Section actions
  createSection: (section: Partial<CustomDaySection>) => Promise<CustomDaySection | null>;
  updateSection: (id: string, updates: Partial<CustomDaySection>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Exercise actions
  createExercise: (exercise: Partial<CustomExercise>) => Promise<CustomExercise | null>;
  updateExercise: (id: string, updates: Partial<CustomExercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  reorderExercises: (sectionId: string, exerciseIds: string[]) => Promise<void>;

  // Utility
  clearCurrentProgram: () => void;
}

export const useCoachProgramStore = create<CoachProgramState>((set, get) => ({
  programs: [],
  currentProgram: null,
  currentDays: [],
  currentSections: {},
  currentExercises: {},
  isLoading: false,
  error: null,

  loadCoachPrograms: async (coachId: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('custom_programs')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({ programs: data || [], isLoading: false });
  },

  createProgram: async (program: Partial<CustomProgram>) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('custom_programs')
      .insert(program)
      .select()
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }

    set((state) => ({
      programs: [data, ...state.programs],
      isLoading: false,
    }));

    return data;
  },

  updateProgram: async (id: string, updates: Partial<CustomProgram>) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('custom_programs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set((state) => ({
      programs: state.programs.map(p => p.id === id ? { ...p, ...updates } : p),
      currentProgram: state.currentProgram?.id === id ? { ...state.currentProgram, ...updates } : state.currentProgram,
      isLoading: false,
    }));
  },

  deleteProgram: async (id: string) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('custom_programs')
      .delete()
      .eq('id', id);

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set((state) => ({
      programs: state.programs.filter(p => p.id !== id),
      currentProgram: state.currentProgram?.id === id ? null : state.currentProgram,
      isLoading: false,
    }));
  },

  loadProgramDetails: async (programId: string) => {
    set({ isLoading: true, error: null });

    // Load program
    const { data: program, error: programError } = await supabase
      .from('custom_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (programError) {
      set({ isLoading: false, error: programError.message });
      return;
    }

    // Load days
    const { data: days, error: daysError } = await supabase
      .from('custom_program_days')
      .select('*')
      .eq('program_id', programId)
      .order('day_number');

    if (daysError) {
      set({ isLoading: false, error: daysError.message });
      return;
    }

    // Load sections for all days
    const dayIds = days?.map(d => d.id) || [];
    let sections: CustomDaySection[] = [];
    
    if (dayIds.length > 0) {
      const { data: sectionsData } = await supabase
        .from('custom_day_sections')
        .select('*')
        .in('day_id', dayIds)
        .order('order_index');
      
      sections = sectionsData || [];
    }

    // Load exercises for all sections
    const sectionIds = sections.map(s => s.id);
    let exercises: CustomExercise[] = [];
    
    if (sectionIds.length > 0) {
      const { data: exercisesData } = await supabase
        .from('custom_exercises')
        .select('*')
        .in('section_id', sectionIds)
        .order('order_index');
      
      exercises = exercisesData || [];
    }

    // Organize sections by day
    const sectionsByDay: Record<string, CustomDaySection[]> = {};
    sections.forEach(s => {
      if (!sectionsByDay[s.day_id]) sectionsByDay[s.day_id] = [];
      sectionsByDay[s.day_id].push(s);
    });

    // Organize exercises by section
    const exercisesBySection: Record<string, CustomExercise[]> = {};
    exercises.forEach(e => {
      if (!exercisesBySection[e.section_id]) exercisesBySection[e.section_id] = [];
      exercisesBySection[e.section_id].push(e);
    });

    set({
      currentProgram: program,
      currentDays: days || [],
      currentSections: sectionsByDay,
      currentExercises: exercisesBySection,
      isLoading: false,
    });
  },

  createDay: async (day: Partial<CustomProgramDay>) => {
    const { data, error } = await supabase
      .from('custom_program_days')
      .insert(day)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set((state) => ({
      currentDays: [...state.currentDays, data].sort((a, b) => a.day_number - b.day_number),
    }));

    return data;
  },

  updateDay: async (id: string, updates: Partial<CustomProgramDay>) => {
    const { error } = await supabase
      .from('custom_program_days')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => ({
      currentDays: state.currentDays.map(d => d.id === id ? { ...d, ...updates } : d),
    }));
  },

  deleteDay: async (id: string) => {
    const { error } = await supabase
      .from('custom_program_days')
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => ({
      currentDays: state.currentDays.filter(d => d.id !== id),
    }));
  },

  createSection: async (section: Partial<CustomDaySection>) => {
    const { data, error } = await supabase
      .from('custom_day_sections')
      .insert(section)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set((state) => ({
      currentSections: {
        ...state.currentSections,
        [data.day_id]: [...(state.currentSections[data.day_id] || []), data],
      },
    }));

    return data;
  },

  updateSection: async (id: string, updates: Partial<CustomDaySection>) => {
    const { error } = await supabase
      .from('custom_day_sections')
      .update(updates)
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => {
      const newSections = { ...state.currentSections };
      Object.keys(newSections).forEach(dayId => {
        newSections[dayId] = newSections[dayId].map(s => s.id === id ? { ...s, ...updates } : s);
      });
      return { currentSections: newSections };
    });
  },

  deleteSection: async (id: string) => {
    const { error } = await supabase
      .from('custom_day_sections')
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => {
      const newSections = { ...state.currentSections };
      Object.keys(newSections).forEach(dayId => {
        newSections[dayId] = newSections[dayId].filter(s => s.id !== id);
      });
      return { currentSections: newSections };
    });
  },

  createExercise: async (exercise: Partial<CustomExercise>) => {
    const { data, error } = await supabase
      .from('custom_exercises')
      .insert(exercise)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set((state) => ({
      currentExercises: {
        ...state.currentExercises,
        [data.section_id]: [...(state.currentExercises[data.section_id] || []), data],
      },
    }));

    return data;
  },

  updateExercise: async (id: string, updates: Partial<CustomExercise>) => {
    const { error } = await supabase
      .from('custom_exercises')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => {
      const newExercises = { ...state.currentExercises };
      Object.keys(newExercises).forEach(sectionId => {
        newExercises[sectionId] = newExercises[sectionId].map(e => e.id === id ? { ...e, ...updates } : e);
      });
      return { currentExercises: newExercises };
    });
  },

  deleteExercise: async (id: string) => {
    const { error } = await supabase
      .from('custom_exercises')
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => {
      const newExercises = { ...state.currentExercises };
      Object.keys(newExercises).forEach(sectionId => {
        newExercises[sectionId] = newExercises[sectionId].filter(e => e.id !== id);
      });
      return { currentExercises: newExercises };
    });
  },

  reorderExercises: async (sectionId: string, exerciseIds: string[]) => {
    // Update order in database
    const updates = exerciseIds.map((id, index) => 
      supabase
        .from('custom_exercises')
        .update({ order_index: index })
        .eq('id', id)
    );

    await Promise.all(updates);

    // Update local state
    set((state) => {
      const exercises = state.currentExercises[sectionId] || [];
      const reordered = exerciseIds.map((id, index) => {
        const exercise = exercises.find(e => e.id === id);
        return exercise ? { ...exercise, order_index: index } : null;
      }).filter(Boolean) as CustomExercise[];

      return {
        currentExercises: {
          ...state.currentExercises,
          [sectionId]: reordered,
        },
      };
    });
  },

  clearCurrentProgram: () => {
    set({
      currentProgram: null,
      currentDays: [],
      currentSections: {},
      currentExercises: {},
    });
  },
}));

