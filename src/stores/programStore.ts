// @ts-nocheck
// TODO: Properly type Supabase queries after full schema stabilization
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AgeCategory } from '@/types/database';

// Types
export interface Program {
  id: string;
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
  is_active: boolean;
  is_featured: boolean;
  is_premium: boolean;
  price_usd: number;
  age_categories?: AgeCategory[];
  min_age?: number;
  max_age?: number;
  created_at: string;
}

export interface ProgramDay {
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

export interface DaySection {
  id: string;
  day_id: string;
  order_index: number;
  title_uk: string;
  title_en?: string;
  title_cs?: string;
  duration_minutes?: number;
}

export interface Exercise {
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

export interface ProgramRequest {
  id: string;
  requested_by: string;
  title: string;
  description?: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  created_at: string;
}

interface ProgramState {
  // Programs list
  programs: Program[];
  featuredPrograms: Program[];
  
  // Current program details
  currentProgram: Program | null;
  currentDays: ProgramDay[];
  currentSections: Record<string, DaySection[]>;
  currentExercises: Record<string, Exercise[]>;
  
  // Admin status
  isAdmin: boolean;
  
  // Program requests
  myRequests: ProgramRequest[];
  allRequests: ProgramRequest[]; // For admin
  
  // Loading
  isLoading: boolean;
  error: string | null;
  
  // Actions
  checkAdminStatus: (userId: string) => Promise<void>;
  loadPrograms: () => Promise<void>;
  loadProgramDetails: (programId: string) => Promise<void>;
  
  // Admin actions
  createProgram: (program: Partial<Program>) => Promise<Program | null>;
  updateProgram: (id: string, updates: Partial<Program>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  createDay: (day: Partial<ProgramDay>) => Promise<ProgramDay | null>;
  updateDay: (id: string, updates: Partial<ProgramDay>) => Promise<void>;
  deleteDay: (id: string) => Promise<void>;
  createSection: (section: Partial<DaySection>) => Promise<DaySection | null>;
  updateSection: (id: string, updates: Partial<DaySection>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  createExercise: (exercise: Partial<Exercise>) => Promise<Exercise | null>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  
  // Request actions
  submitRequest: (title: string, description?: string, category?: string) => Promise<void>;
  loadMyRequests: (userId: string) => Promise<void>;
  loadAllRequests: () => Promise<void>; // Admin only
  updateRequestStatus: (requestId: string, status: string, notes?: string) => Promise<void>;
  
  // Utility
  clearCurrentProgram: () => void;
}

export const useProgramStore = create<ProgramState>((set, _get) => ({
  programs: [],
  featuredPrograms: [],
  currentProgram: null,
  currentDays: [],
  currentSections: {},
  currentExercises: {},
  isAdmin: false,
  myRequests: [],
  allRequests: [],
  isLoading: false,
  error: null,

  checkAdminStatus: async (userId: string) => {
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    set({ isAdmin: !!data });
  },

  loadPrograms: async () => {
    set({ isLoading: true, error: null });
    console.log('[ProgramStore] Loading programs...');

    const { data, error } = await supabase
      .from('programs' as any)
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProgramStore] Error loading programs:', error);
      set({ isLoading: false, error: error.message });
      return;
    }

    console.log('[ProgramStore] Programs loaded:', data?.length || 0, 'programs', data);
    const programs = (data || []) as Program[];
    const featured = programs.filter(p => p.is_featured);
    set({ 
      programs, 
      featuredPrograms: featured,
      isLoading: false 
    });
  },

  loadProgramDetails: async (programId: string) => {
    set({ isLoading: true, error: null });

    // Load program
    const { data: program, error: programError } = await supabase
      .from('programs' as any)
      .select('*')
      .eq('id', programId)
      .single();

    if (programError) {
      set({ isLoading: false, error: programError.message });
      return;
    }

    // Load days
    const { data: days } = await supabase
      .from('program_days' as any)
      .select('*')
      .eq('program_id', programId)
      .order('day_number');

    // Load sections
    const daysTyped = (days || []) as ProgramDay[];
    const dayIds = daysTyped.map(d => d.id);
    let sections: DaySection[] = [];
    
    if (dayIds.length > 0) {
      const { data: sectionsData } = await supabase
        .from('day_sections' as any)
        .select('*')
        .in('day_id', dayIds)
        .order('order_index');
      
      sections = (sectionsData || []) as DaySection[];
    }

    // Load exercises
    const sectionIds = sections.map(s => s.id);
    let exercises: Exercise[] = [];
    
    if (sectionIds.length > 0) {
      const { data: exercisesData } = await supabase
        .from('exercises' as any)
        .select('*')
        .in('section_id', sectionIds)
        .order('order_index');
      
      exercises = (exercisesData || []) as Exercise[];
    }

    // Organize by parent
    const sectionsByDay: Record<string, DaySection[]> = {};
    sections.forEach(s => {
      if (!sectionsByDay[s.day_id]) sectionsByDay[s.day_id] = [];
      sectionsByDay[s.day_id].push(s);
    });

    const exercisesBySection: Record<string, Exercise[]> = {};
    exercises.forEach(e => {
      if (!exercisesBySection[e.section_id]) exercisesBySection[e.section_id] = [];
      exercisesBySection[e.section_id].push(e);
    });

    set({
      currentProgram: program as Program,
      currentDays: daysTyped,
      currentSections: sectionsByDay,
      currentExercises: exercisesBySection,
      isLoading: false,
    });
  },

  // Admin: Create Program
  createProgram: async (program: Partial<Program>) => {
    const { data, error } = await supabase
      .from('programs' as any)
      .insert(program as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set((state) => ({
      programs: [data as Program, ...state.programs],
    }));

    return data as Program;
  },

  updateProgram: async (id: string, updates: Partial<Program>) => {
    const query = supabase.from('programs' as any);
    // @ts-ignore - Supabase types not generated for new tables
    const { error } = await query.update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => ({
      programs: state.programs.map(p => p.id === id ? { ...p, ...updates } : p),
      currentProgram: state.currentProgram?.id === id ? { ...state.currentProgram, ...updates } : state.currentProgram,
    }));
  },

  deleteProgram: async (id: string) => {
    const { error } = await supabase
      .from('programs' as any)
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => ({
      programs: state.programs.filter(p => p.id !== id),
      currentProgram: state.currentProgram?.id === id ? null : state.currentProgram,
    }));
  },

  createDay: async (day: Partial<ProgramDay>) => {
    const { data, error } = await supabase
      .from('program_days' as any)
      .insert(day as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    const newDay = data as ProgramDay;
    set((state) => ({
      currentDays: [...state.currentDays, newDay].sort((a, b) => a.day_number - b.day_number),
    }));

    return newDay;
  },

  updateDay: async (id: string, updates: Partial<ProgramDay>) => {
    const query = supabase.from('program_days' as any);
    // @ts-ignore - Supabase types not generated for new tables
    const { error } = await query.update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);

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
      .from('program_days' as any)
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

  createSection: async (section: Partial<DaySection>) => {
    const { data, error } = await supabase
      .from('day_sections' as any)
      .insert(section as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    const newSection = data as DaySection;
    set((state) => ({
      currentSections: {
        ...state.currentSections,
        [newSection.day_id]: [...(state.currentSections[newSection.day_id] || []), newSection],
      },
    }));

    return newSection;
  },

  updateSection: async (id: string, updates: Partial<DaySection>) => {
    const query = supabase.from('day_sections' as any);
    // @ts-ignore - Supabase types not generated for new tables
    const { error } = await query.update(updates).eq('id', id);

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
      .from('day_sections' as any)
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

  createExercise: async (exercise: Partial<Exercise>) => {
    const { data, error } = await supabase
      .from('exercises' as any)
      .insert(exercise as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    const newExercise = data as Exercise;
    set((state) => ({
      currentExercises: {
        ...state.currentExercises,
        [newExercise.section_id]: [...(state.currentExercises[newExercise.section_id] || []), newExercise],
      },
    }));

    return newExercise;
  },

  updateExercise: async (id: string, updates: Partial<Exercise>) => {
    const query = supabase.from('exercises' as any);
    // @ts-ignore - Supabase types not generated for new tables
    const { error } = await query.update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);

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
      .from('exercises' as any)
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

  // Program Requests
  submitRequest: async (title: string, description?: string, category?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('program_requests' as any)
      .insert({
        requested_by: user.id,
        title,
        description,
        category,
      } as any);

    if (error) {
      set({ error: error.message });
    }
  },

  loadMyRequests: async (userId: string) => {
    const { data, error } = await supabase
      .from('program_requests' as any)
      .select('*')
      .eq('requested_by', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      set({ myRequests: (data || []) as ProgramRequest[] });
    }
  },

  loadAllRequests: async () => {
    const { data, error } = await supabase
      .from('program_requests' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      set({ allRequests: (data || []) as ProgramRequest[] });
    }
  },

  updateRequestStatus: async (requestId: string, status: string, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const query = supabase.from('program_requests' as any);
    // @ts-ignore - Supabase types not generated for new tables
    const { error } = await query.update({
      status,
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id,
    }).eq('id', requestId);

    if (!error) {
      set((state) => ({
        allRequests: state.allRequests.map(r => 
          r.id === requestId ? { ...r, status: status as any, admin_notes: notes } : r
        ),
      }));
    }
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

