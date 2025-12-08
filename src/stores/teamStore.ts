// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Team {
  id: string;
  name: string;
  code: string;
  coach_id: string;
  created_at: string;
  settings: Record<string, unknown>;
}

export interface TeamMember {
  id: string;
  team_id: string;
  player_id: string;
  parent_id: string | null;
  role: 'player' | 'assistant';
  joined_at: string;
  status: 'active' | 'inactive' | 'pending';
  // Joined data
  profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    show_in_leaderboard: boolean;
  };
  stats?: {
    total_xp: number;
    current_streak: number;
    total_exercises: number;
  };
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;

  // Coach actions
  loadCoachTeams: (coachId: string) => Promise<void>;
  createTeam: (coachId: string, name: string) => Promise<{ team?: Team; error?: string }>;
  deleteTeam: (teamId: string) => Promise<{ error?: string }>;
  loadTeamMembers: (teamId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<{ error?: string }>;

  // Player actions
  loadPlayerTeams: (playerId: string) => Promise<void>;
  joinTeam: (playerId: string, teamCode: string) => Promise<{ error?: string }>;
  leaveTeam: (memberId: string) => Promise<{ error?: string }>;

  // Common
  setCurrentTeam: (team: Team | null) => void;
  clearError: () => void;
}

// Generate random team code
const generateTeamCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  members: [],
  isLoading: false,
  error: null,

  // Coach: Load teams where user is coach
  loadCoachTeams: async (coachId: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({ teams: data || [], isLoading: false });
  },

  // Coach: Create new team
  createTeam: async (coachId: string, name: string) => {
    set({ isLoading: true, error: null });

    // Generate unique code
    let code = generateTeamCode();
    let attempts = 0;
    
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('teams')
        .select('id')
        .eq('code', code)
        .single();
      
      if (!existing) break;
      code = generateTeamCode();
      attempts++;
    }

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        code,
        coach_id: coachId,
      })
      .select()
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      teams: [data, ...state.teams],
      isLoading: false,
    }));

    return { team: data };
  },

  // Coach: Delete team
  deleteTeam: async (teamId: string) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      teams: state.teams.filter(t => t.id !== teamId),
      currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
      isLoading: false,
    }));

    return {};
  },

  // Coach: Load team members with profiles and stats
  loadTeamMembers: async (teamId: string) => {
    set({ isLoading: true, error: null });

    // First, get team members
    const { data: membersData, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (membersError) {
      set({ isLoading: false, error: membersError.message });
      return;
    }

    // Get player IDs
    const playerIds = (membersData || []).map(m => m.player_id);
    
    let profilesMap: Record<string, any> = {};
    let statsMap: Record<string, any> = {};
    
    if (playerIds.length > 0) {
      // Get profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, show_in_leaderboard')
        .in('id', playerIds);
      
      if (profilesData) {
        profilesMap = profilesData.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as Record<string, any>);
      }

      // Get stats
      const { data: statsData } = await supabase
        .from('player_stats')
        .select('player_id, total_xp, current_streak, total_exercises')
        .in('player_id', playerIds);
      
      if (statsData) {
        statsMap = statsData.reduce((acc, s) => {
          acc[s.player_id] = s;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Combine data
    const members = (membersData || []).map(m => ({
      ...m,
      profile: profilesMap[m.player_id] || null,
      stats: statsMap[m.player_id] || { total_xp: 0, current_streak: 0, total_exercises: 0 },
    }));

    set({ members, isLoading: false });
  },

  // Coach: Remove member from team
  removeMember: async (memberId: string) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      members: state.members.filter(m => m.id !== memberId),
      isLoading: false,
    }));

    return {};
  },

  // Player: Load teams where user is member
  loadPlayerTeams: async (playerId: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams (*)
      `)
      .eq('player_id', playerId)
      .eq('status', 'active');

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    const teams = (data || [])
      .map(m => m.team)
      .filter(Boolean) as Team[];

    set({ teams, isLoading: false });
  },

  // Player: Join team by code
  joinTeam: async (playerId: string, teamCode: string) => {
    set({ isLoading: true, error: null });

    const code = teamCode.toUpperCase().trim();

    // Find team by code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (teamError) {
      set({ isLoading: false, error: teamError.message });
      return { error: teamError.message };
    }

    if (!team) {
      set({ isLoading: false, error: 'Team not found' });
      return { error: 'Команду не знайдено' };
    }

    // Check if already member
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('player_id', playerId)
      .maybeSingle();

    if (existing) {
      set({ isLoading: false, error: 'Already a member' });
      return { error: 'Ви вже в цій команді' };
    }

    // Join team
    const { error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        player_id: playerId,
        role: 'player',
        status: 'active',
      });

    if (joinError) {
      set({ isLoading: false, error: joinError.message });
      return { error: joinError.message };
    }

    set((state) => ({
      teams: [...state.teams, team],
      isLoading: false,
    }));

    return {};
  },

  // Player: Leave team
  leaveTeam: async (memberId: string) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    // Reload teams
    set({ isLoading: false });
    return {};
  },

  setCurrentTeam: (team) => set({ currentTeam: team }),
  clearError: () => set({ error: null }),
}));

