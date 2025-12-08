// @ts-nocheck
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema
interface FootballTrainerDB extends DBSchema {
  // Cache for programs
  programs: {
    key: string;
    value: {
      id: string;
      data: any;
      cachedAt: number;
    };
  };
  // Cache for program days
  programDays: {
    key: string;
    value: {
      id: string;
      programId: string;
      data: any;
      cachedAt: number;
    };
    indexes: { 'by-program': string };
  };
  // Cache for exercises
  exercises: {
    key: string;
    value: {
      id: string;
      sectionId: string;
      data: any;
      cachedAt: number;
    };
    indexes: { 'by-section': string };
  };
  // Offline progress queue (to sync when online)
  progressQueue: {
    key: number;
    value: {
      id?: number;
      type: 'exercise_complete' | 'day_complete' | 'measurement';
      playerId: string;
      dayKey: string;
      exerciseId?: string;
      value?: string;
      xp?: number;
      timestamp: number;
      synced: boolean;
    };
  };
  // User profile cache
  profile: {
    key: string;
    value: {
      id: string;
      data: any;
      cachedAt: number;
    };
  };
  // Player stats cache
  stats: {
    key: string;
    value: {
      playerId: string;
      data: any;
      cachedAt: number;
    };
  };
  // Completed days cache
  completedDays: {
    key: string;
    value: {
      playerId: string;
      dayKey: string;
      completedAt: number;
    };
  };
}

const DB_NAME = 'football-trainer-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FootballTrainerDB> | null = null;

// Initialize database
export async function initDB(): Promise<IDBPDatabase<FootballTrainerDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FootballTrainerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Programs store
      if (!db.objectStoreNames.contains('programs')) {
        db.createObjectStore('programs', { keyPath: 'id' });
      }

      // Program days store
      if (!db.objectStoreNames.contains('programDays')) {
        const store = db.createObjectStore('programDays', { keyPath: 'id' });
        store.createIndex('by-program', 'programId');
      }

      // Exercises store
      if (!db.objectStoreNames.contains('exercises')) {
        const store = db.createObjectStore('exercises', { keyPath: 'id' });
        store.createIndex('by-section', 'sectionId');
      }

      // Progress queue store
      if (!db.objectStoreNames.contains('progressQueue')) {
        db.createObjectStore('progressQueue', { keyPath: 'id', autoIncrement: true });
      }

      // Profile store
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }

      // Stats store
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'playerId' });
      }

      // Completed days store
      if (!db.objectStoreNames.contains('completedDays')) {
        db.createObjectStore('completedDays', { keyPath: 'dayKey' });
      }
    },
  });

  return dbInstance;
}

// ==================== PROGRAMS ====================

export async function cachePrograms(programs: any[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('programs', 'readwrite');
  
  for (const program of programs) {
    await tx.store.put({
      id: program.id,
      data: program,
      cachedAt: Date.now(),
    });
  }
  
  await tx.done;
}

export async function getCachedPrograms(): Promise<any[]> {
  const db = await initDB();
  const items = await db.getAll('programs');
  return items.map(item => item.data);
}

export async function getCachedProgram(id: string): Promise<any | null> {
  const db = await initDB();
  const item = await db.get('programs', id);
  return item?.data || null;
}

// ==================== PROGRAM DAYS ====================

export async function cacheProgramDays(programId: string, days: any[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('programDays', 'readwrite');
  
  for (const day of days) {
    await tx.store.put({
      id: day.id,
      programId,
      data: day,
      cachedAt: Date.now(),
    });
  }
  
  await tx.done;
}

export async function getCachedProgramDays(programId: string): Promise<any[]> {
  const db = await initDB();
  const items = await db.getAllFromIndex('programDays', 'by-program', programId);
  return items.map(item => item.data);
}

// ==================== EXERCISES ====================

export async function cacheExercises(sectionId: string, exercises: any[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('exercises', 'readwrite');
  
  for (const exercise of exercises) {
    await tx.store.put({
      id: exercise.id,
      sectionId,
      data: exercise,
      cachedAt: Date.now(),
    });
  }
  
  await tx.done;
}

export async function getCachedExercises(sectionId: string): Promise<any[]> {
  const db = await initDB();
  const items = await db.getAllFromIndex('exercises', 'by-section', sectionId);
  return items.map(item => item.data);
}

// ==================== PROGRESS QUEUE ====================

export async function queueProgress(item: Omit<FootballTrainerDB['progressQueue']['value'], 'id' | 'synced'>): Promise<void> {
  const db = await initDB();
  await db.add('progressQueue', {
    ...item,
    synced: false,
  });
}

export async function getUnsyncedProgress(): Promise<FootballTrainerDB['progressQueue']['value'][]> {
  const db = await initDB();
  const all = await db.getAll('progressQueue');
  return all.filter(item => !item.synced);
}

export async function markProgressSynced(id: number): Promise<void> {
  const db = await initDB();
  const item = await db.get('progressQueue', id);
  if (item) {
    item.synced = true;
    await db.put('progressQueue', item);
  }
}

export async function clearSyncedProgress(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('progressQueue', 'readwrite');
  const all = await tx.store.getAll();
  
  for (const item of all) {
    if (item.synced && item.id) {
      await tx.store.delete(item.id);
    }
  }
  
  await tx.done;
}

// ==================== PROFILE ====================

export async function cacheProfile(profile: any): Promise<void> {
  const db = await initDB();
  await db.put('profile', {
    id: profile.id,
    data: profile,
    cachedAt: Date.now(),
  });
}

export async function getCachedProfile(id: string): Promise<any | null> {
  const db = await initDB();
  const item = await db.get('profile', id);
  return item?.data || null;
}

// ==================== STATS ====================

export async function cacheStats(playerId: string, stats: any): Promise<void> {
  const db = await initDB();
  await db.put('stats', {
    playerId,
    data: stats,
    cachedAt: Date.now(),
  });
}

export async function getCachedStats(playerId: string): Promise<any | null> {
  const db = await initDB();
  const item = await db.get('stats', playerId);
  return item?.data || null;
}

// ==================== COMPLETED DAYS ====================

export async function cacheCompletedDay(playerId: string, dayKey: string): Promise<void> {
  const db = await initDB();
  await db.put('completedDays', {
    playerId,
    dayKey,
    completedAt: Date.now(),
  });
}

export async function getCachedCompletedDays(playerId: string): Promise<string[]> {
  const db = await initDB();
  const all = await db.getAll('completedDays');
  return all.filter(item => item.playerId === playerId).map(item => item.dayKey);
}

// ==================== UTILITIES ====================

export async function clearAllCache(): Promise<void> {
  const db = await initDB();
  
  const stores: (keyof FootballTrainerDB)[] = [
    'programs', 'programDays', 'exercises', 'profile', 'stats', 'completedDays'
  ];
  
  for (const store of stores) {
    await db.clear(store);
  }
}

export async function getCacheSize(): Promise<number> {
  const db = await initDB();
  let size = 0;
  
  const stores: (keyof FootballTrainerDB)[] = [
    'programs', 'programDays', 'exercises', 'progressQueue', 'profile', 'stats', 'completedDays'
  ];
  
  for (const store of stores) {
    const count = await db.count(store);
    size += count;
  }
  
  return size;
}

