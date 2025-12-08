// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import {
  checkWebAPIsSupport,
  getStepCount,
  resetStepCount,
  onStepUpdate,
  connectHeartRateMonitor,
  disconnectHeartRateMonitor,
  isHeartRateConnected,
  onHeartRateUpdate,
  startGPSTracking,
  stopGPSTracking,
  onGPSUpdate,
  calculateDistance,
  startWorkoutSession,
  endWorkoutSession,
  getCurrentSession,
  getTrackerConnections,
  saveTrackerConnection,
  getDailyFitnessData,
  getWorkoutSessions,
  saveDailyFitnessData,
  TrackerConnection,
  WorkoutSession,
  FitnessData,
} from '@/lib/fitnessTrackers';

interface UseFitnessTrackerReturn {
  // Support status
  support: {
    pedometer: boolean;
    heartRate: boolean;
    geolocation: boolean;
    deviceMotion: boolean;
  };
  
  // Current data
  steps: number;
  heartRate: number | null;
  distance: number;
  isTracking: boolean;
  
  // Heart rate monitor
  isHRConnected: boolean;
  connectHR: () => Promise<boolean>;
  disconnectHR: () => Promise<void>;
  
  // Workout session
  currentSession: WorkoutSession | null;
  startSession: (programId?: string, dayKey?: string) => void;
  endSession: () => Promise<WorkoutSession | null>;
  
  // Tracker connections
  connections: TrackerConnection[];
  refreshConnections: () => Promise<void>;
  
  // Historical data
  weeklyData: FitnessData[];
  recentWorkouts: WorkoutSession[];
  loadHistoricalData: () => Promise<void>;
  
  // Manual entry
  saveManualData: (data: Partial<FitnessData>) => Promise<void>;
}

export function useFitnessTracker(playerId?: string): UseFitnessTrackerReturn {
  const [support] = useState(checkWebAPIsSupport());
  const [steps, setSteps] = useState(0);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [distance, setDistance] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isHRConnected, setIsHRConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [connections, setConnections] = useState<TrackerConnection[]>([]);
  const [weeklyData, setWeeklyData] = useState<FitnessData[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [positions, setPositions] = useState<GeolocationPosition[]>([]);

  // Load connections on mount
  useEffect(() => {
    if (playerId) {
      refreshConnections();
      loadHistoricalData();
    }
  }, [playerId]);

  // Subscribe to step updates
  useEffect(() => {
    if (!isTracking) return;

    const unsubscribe = onStepUpdate((newSteps) => {
      setSteps(newSteps);
    });

    return unsubscribe;
  }, [isTracking]);

  // Subscribe to heart rate updates
  useEffect(() => {
    if (!isHRConnected) return;

    const unsubscribe = onHeartRateUpdate((hr) => {
      setHeartRate(hr);
    });

    return unsubscribe;
  }, [isHRConnected]);

  // Subscribe to GPS updates
  useEffect(() => {
    if (!isTracking) return;

    const unsubscribe = onGPSUpdate((position) => {
      setPositions(prev => {
        const newPositions = [...prev, position];
        setDistance(calculateDistance(newPositions));
        return newPositions;
      });
    });

    return unsubscribe;
  }, [isTracking]);

  // Connect heart rate monitor
  const connectHR = useCallback(async (): Promise<boolean> => {
    const success = await connectHeartRateMonitor();
    setIsHRConnected(success);
    
    if (success && playerId) {
      await saveTrackerConnection(playerId, {
        provider: 'web',
        isConnected: true,
        lastSync: new Date(),
        permissions: ['heart_rate'],
      });
    }
    
    return success;
  }, [playerId]);

  // Disconnect heart rate monitor
  const disconnectHR = useCallback(async (): Promise<void> => {
    await disconnectHeartRateMonitor();
    setIsHRConnected(false);
    setHeartRate(null);
  }, []);

  // Start workout session
  const startSession = useCallback((programId?: string, dayKey?: string) => {
    if (!playerId) return;

    const session = startWorkoutSession(playerId, programId, dayKey);
    setCurrentSession(session);
    setIsTracking(true);
    setSteps(0);
    setDistance(0);
    setPositions([]);
  }, [playerId]);

  // End workout session
  const endSession = useCallback(async (): Promise<WorkoutSession | null> => {
    setIsTracking(false);
    const session = await endWorkoutSession();
    setCurrentSession(null);
    
    if (session) {
      setRecentWorkouts(prev => [session, ...prev].slice(0, 10));
    }
    
    return session;
  }, []);

  // Refresh tracker connections
  const refreshConnections = useCallback(async () => {
    if (!playerId) return;
    const conns = await getTrackerConnections(playerId);
    setConnections(conns);
  }, [playerId]);

  // Load historical data
  const loadHistoricalData = useCallback(async () => {
    if (!playerId) return;

    // Get last 7 days of fitness data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const [fitnessData, workouts] = await Promise.all([
      getDailyFitnessData(playerId, startDate, endDate),
      getWorkoutSessions(playerId, 10),
    ]);

    setWeeklyData(fitnessData);
    setRecentWorkouts(workouts);
  }, [playerId]);

  // Save manual data
  const saveManualData = useCallback(async (data: Partial<FitnessData>) => {
    if (!playerId) return;

    await saveDailyFitnessData(playerId, {
      ...data,
      timestamp: new Date(),
    } as FitnessData);

    await loadHistoricalData();
  }, [playerId, loadHistoricalData]);

  return {
    support,
    steps,
    heartRate,
    distance,
    isTracking,
    isHRConnected,
    connectHR,
    disconnectHR,
    currentSession,
    startSession,
    endSession,
    connections,
    refreshConnections,
    weeklyData,
    recentWorkouts,
    loadHistoricalData,
    saveManualData,
  };
}

