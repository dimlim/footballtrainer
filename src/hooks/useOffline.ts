import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getUnsyncedProgress,
  markProgressSynced,
  clearSyncedProgress,
  cachePrograms,
  cacheProgramDays,
  cacheProfile,
  cacheStats,
  cacheCompletedDay,
  getCachedPrograms,
  getCachedProgramDays,
  getCachedProfile,
  getCachedStats,
  getCachedCompletedDays,
} from '@/lib/offlineStorage';

interface UseOfflineReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
  lastSyncTime: Date | null;
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncProgress();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check pending items count
  useEffect(() => {
    const checkPending = async () => {
      const unsynced = await getUnsyncedProgress();
      setPendingCount(unsynced.length);
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync progress to server
  const syncProgress = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      const unsynced = await getUnsyncedProgress();
      
      for (const item of unsynced) {
        try {
          switch (item.type) {
            case 'exercise_complete':
              // Sync exercise completion
              await supabase.from('player_progress_v2').upsert({
                player_id: item.playerId,
                day_key: item.dayKey,
                exercise_id: item.exerciseId,
                is_completed: true,
                completed_at: new Date(item.timestamp).toISOString(),
                xp_earned: item.xp || 0,
              }, {
                onConflict: 'player_id,day_key,exercise_id',
              });
              break;

            case 'day_complete':
              // Sync day completion
              await supabase.from('player_day_completions').upsert({
                player_id: item.playerId,
                day_key: item.dayKey,
                completed_at: new Date(item.timestamp).toISOString(),
                xp_earned: item.xp || 0,
              }, {
                onConflict: 'player_id,day_key',
              });
              break;

            case 'measurement':
              // Sync measurement
              await supabase.from('player_progress_v2').upsert({
                player_id: item.playerId,
                day_key: item.dayKey,
                exercise_id: item.exerciseId,
                measurement_value: item.value,
              }, {
                onConflict: 'player_id,day_key,exercise_id',
              });
              break;
          }

          // Mark as synced
          if (item.id) {
            await markProgressSynced(item.id);
          }
        } catch (error) {
          console.error('Error syncing item:', error);
        }
      }

      // Clear synced items
      await clearSyncedProgress();
      
      // Update pending count
      const remaining = await getUnsyncedProgress();
      setPendingCount(remaining.length);
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync periodically when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(syncProgress, 30000); // Sync every 30 seconds
    return () => clearInterval(interval);
  }, [isOnline, syncProgress]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncNow: syncProgress,
    lastSyncTime,
  };
}

// Hook for caching data when online
export function useOfflineCache() {
  const { isOnline } = useOffline();

  const cacheAllData = useCallback(async (playerId: string) => {
    if (!isOnline) return;

    try {
      // Cache programs
      const { data: programs } = await supabase
        .from('programs' as any)
        .select('*')
        .eq('is_active', true);
      
      if (programs) {
        await cachePrograms(programs);
      }

      // Cache profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', playerId)
        .single();
      
      if (profile) {
        await cacheProfile(profile);
      }

      // Cache stats
      const { data: stats } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', playerId)
        .single();
      
      if (stats) {
        await cacheStats(playerId, stats);
      }

      console.log('Data cached for offline use');
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }, [isOnline]);

  const getCachedData = useCallback(async (playerId: string) => {
    return {
      programs: await getCachedPrograms(),
      profile: await getCachedProfile(playerId),
      stats: await getCachedStats(playerId),
      completedDays: await getCachedCompletedDays(playerId),
    };
  }, []);

  return {
    cacheAllData,
    getCachedData,
  };
}

