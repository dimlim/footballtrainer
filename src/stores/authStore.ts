import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole, Language } from '@/types/database';
import type { User, Session } from '@supabase/supabase-js';
import { trackUserLogin, trackUserRegistration, trackUserLogout } from '@/lib/analytics';
import { activityLogger } from '@/lib/activityLogger';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({ 
          user: session.user, 
          session, 
          profile: profile || null,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({ 
          user: null, 
          session: null, 
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          set({ user: session.user, session, profile: profile || null });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, session: null, profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        set({ 
          user: data.user, 
          session: data.session, 
          profile: profile || null,
          isLoading: false,
        });

        // Track login event
        trackUserLogin('email');

        // Log activity and start session
        await activityLogger.log(data.user.id, 'login');
        await activityLogger.startSession(data.user.id);
      }

      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signUp: async (email: string, password: string, fullName: string, role: UserRole) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: role,
            language: 'uk' as Language,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create initial stats
        await supabase
          .from('player_stats')
          .insert({
            player_id: data.user.id,
            total_xp: 0,
            current_streak: 0,
            longest_streak: 0,
            total_exercises: 0,
            total_training_minutes: 0,
          });

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({ 
          user: data.user, 
          session: data.session, 
          profile: profile || null,
          isLoading: false,
        });

        // Track registration event
        trackUserRegistration('email', role);
      }

      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signOut: async () => {
    const { user } = get();
    set({ isLoading: true });
    
    // Track logout event
    trackUserLogout();

    // Log activity and end session
    if (user) {
      await activityLogger.log(user.id, 'logout');
      await activityLogger.endSession(user.id);
    }
    
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, isLoading: false });
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    console.log('updateProfile called with:', updates, 'user:', user?.id);
    
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error, data } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select();

      console.log('Supabase update result:', { error, data });

      if (error) return { error: error.message };

      // Refresh profile
      await get().refreshProfile();
      return { error: null };
    } catch (err) {
      console.error('updateProfile catch error:', err);
      return { error: 'Failed to update profile' };
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      set({ profile });
    }
  },
}));

