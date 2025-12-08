/**
 * Fitness Trackers Integration Service
 * 
 * Supports:
 * - Web APIs (Pedometer, Heart Rate via Web Bluetooth)
 * - Preparation for native integrations (Apple Health, Google Fit)
 * - Manual data entry fallback
 */

import { supabase } from './supabase';

// Types for fitness data
export interface FitnessData {
  steps?: number;
  distance?: number; // in meters
  calories?: number;
  heartRate?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  activeMinutes?: number;
  sleepHours?: number;
  timestamp: Date;
}

export interface WorkoutSession {
  id?: string;
  playerId: string;
  programId?: string;
  dayKey?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  heartRateData?: number[]; // array of HR readings
  heartRateAvg?: number;
  heartRateMax?: number;
  caloriesBurned?: number;
  steps?: number;
  distance?: number;
  source: 'manual' | 'web' | 'apple_health' | 'google_fit' | 'garmin' | 'fitbit';
}

export interface TrackerConnection {
  provider: 'apple_health' | 'google_fit' | 'garmin' | 'fitbit' | 'web';
  isConnected: boolean;
  lastSync?: Date;
  permissions?: string[];
}

// Check if Web APIs are available
export function checkWebAPIsSupport(): {
  pedometer: boolean;
  heartRate: boolean;
  geolocation: boolean;
  deviceMotion: boolean;
} {
  return {
    pedometer: 'Accelerometer' in window || 'DeviceMotionEvent' in window,
    heartRate: 'bluetooth' in navigator,
    geolocation: 'geolocation' in navigator,
    deviceMotion: 'DeviceMotionEvent' in window,
  };
}

// ==================== STEP COUNTER (Web API) ====================

let stepCount = 0;
let lastAcceleration = { x: 0, y: 0, z: 0 };
let stepThreshold = 12; // Sensitivity for step detection
let stepCallbacks: ((steps: number) => void)[] = [];

export function startStepCounter(): boolean {
  if (!('DeviceMotionEvent' in window)) {
    console.warn('DeviceMotionEvent not supported');
    return false;
  }

  // Request permission on iOS 13+
  if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    (DeviceMotionEvent as any).requestPermission()
      .then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('devicemotion', handleMotion);
  }

  return true;
}

function handleMotion(event: DeviceMotionEvent) {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;

  const { x, y, z } = acceleration;
  if (x === null || y === null || z === null) return;

  // Calculate magnitude difference
  const delta = Math.abs(
    Math.sqrt(x * x + y * y + z * z) -
    Math.sqrt(
      lastAcceleration.x * lastAcceleration.x +
      lastAcceleration.y * lastAcceleration.y +
      lastAcceleration.z * lastAcceleration.z
    )
  );

  // Detect step
  if (delta > stepThreshold) {
    stepCount++;
    stepCallbacks.forEach(cb => cb(stepCount));
  }

  lastAcceleration = { x, y, z };
}

export function stopStepCounter(): void {
  window.removeEventListener('devicemotion', handleMotion);
}

export function getStepCount(): number {
  return stepCount;
}

export function resetStepCount(): void {
  stepCount = 0;
}

export function onStepUpdate(callback: (steps: number) => void): () => void {
  stepCallbacks.push(callback);
  return () => {
    stepCallbacks = stepCallbacks.filter(cb => cb !== callback);
  };
}

// ==================== HEART RATE (Web Bluetooth) ====================

let heartRateDevice: BluetoothDevice | null = null;
let heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let heartRateCallbacks: ((hr: number) => void)[] = [];

export async function connectHeartRateMonitor(): Promise<boolean> {
  if (!('bluetooth' in navigator)) {
    console.warn('Web Bluetooth not supported');
    return false;
  }

  try {
    // Request heart rate device
    heartRateDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['battery_service'],
    });

    const server = await heartRateDevice.gatt?.connect();
    if (!server) return false;

    const service = await server.getPrimaryService('heart_rate');
    heartRateCharacteristic = await service.getCharacteristic('heart_rate_measurement');

    // Start notifications
    await heartRateCharacteristic.startNotifications();
    heartRateCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRateChange);

    console.log('Heart rate monitor connected');
    return true;
  } catch (error) {
    console.error('Error connecting heart rate monitor:', error);
    return false;
  }
}

function handleHeartRateChange(event: Event) {
  const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
  if (!value) return;

  // Parse heart rate value (first byte is flags, second is HR)
  const flags = value.getUint8(0);
  let heartRate: number;

  if (flags & 0x01) {
    // 16-bit heart rate
    heartRate = value.getUint16(1, true);
  } else {
    // 8-bit heart rate
    heartRate = value.getUint8(1);
  }

  heartRateCallbacks.forEach(cb => cb(heartRate));
}

export async function disconnectHeartRateMonitor(): Promise<void> {
  if (heartRateCharacteristic) {
    await heartRateCharacteristic.stopNotifications();
    heartRateCharacteristic.removeEventListener('characteristicvaluechanged', handleHeartRateChange);
  }
  if (heartRateDevice?.gatt?.connected) {
    heartRateDevice.gatt.disconnect();
  }
  heartRateDevice = null;
  heartRateCharacteristic = null;
}

export function onHeartRateUpdate(callback: (hr: number) => void): () => void {
  heartRateCallbacks.push(callback);
  return () => {
    heartRateCallbacks = heartRateCallbacks.filter(cb => cb !== callback);
  };
}

export function isHeartRateConnected(): boolean {
  return heartRateDevice?.gatt?.connected || false;
}

// ==================== GPS TRACKING ====================

let watchId: number | null = null;
let gpsCallbacks: ((position: GeolocationPosition) => void)[] = [];
let trackingData: GeolocationPosition[] = [];

export function startGPSTracking(): boolean {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocation not supported');
    return false;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      trackingData.push(position);
      gpsCallbacks.forEach(cb => cb(position));
    },
    (error) => {
      console.error('GPS error:', error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000,
    }
  );

  return true;
}

export function stopGPSTracking(): GeolocationPosition[] {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  const data = [...trackingData];
  trackingData = [];
  return data;
}

export function onGPSUpdate(callback: (position: GeolocationPosition) => void): () => void {
  gpsCallbacks.push(callback);
  return () => {
    gpsCallbacks = gpsCallbacks.filter(cb => cb !== callback);
  };
}

export function calculateDistance(positions: GeolocationPosition[]): number {
  if (positions.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1].coords;
    const curr = positions[i].coords;
    totalDistance += haversineDistance(
      prev.latitude, prev.longitude,
      curr.latitude, curr.longitude
    );
  }
  return totalDistance;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ==================== WORKOUT SESSION ====================

let currentSession: WorkoutSession | null = null;
let sessionHeartRates: number[] = [];

export function startWorkoutSession(
  playerId: string,
  programId?: string,
  dayKey?: string
): WorkoutSession {
  currentSession = {
    playerId,
    programId,
    dayKey,
    startTime: new Date(),
    heartRateData: [],
    source: 'web',
  };

  sessionHeartRates = [];

  // Start tracking
  startStepCounter();
  startGPSTracking();

  // Subscribe to heart rate if connected
  onHeartRateUpdate((hr) => {
    sessionHeartRates.push(hr);
  });

  return currentSession;
}

export async function endWorkoutSession(): Promise<WorkoutSession | null> {
  if (!currentSession) return null;

  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
  const positions = stopGPSTracking();
  stopStepCounter();

  // Calculate stats
  const heartRateAvg = sessionHeartRates.length > 0
    ? Math.round(sessionHeartRates.reduce((a, b) => a + b, 0) / sessionHeartRates.length)
    : undefined;
  const heartRateMax = sessionHeartRates.length > 0
    ? Math.max(...sessionHeartRates)
    : undefined;

  // Estimate calories (rough calculation)
  // MET for moderate exercise ≈ 5, calories = MET × weight(kg) × time(hours)
  // Using average weight of 70kg
  const caloriesBurned = Math.round(5 * 70 * (duration / 3600));

  currentSession = {
    ...currentSession,
    endTime,
    duration,
    heartRateData: sessionHeartRates,
    heartRateAvg,
    heartRateMax,
    caloriesBurned,
    steps: getStepCount(),
    distance: calculateDistance(positions),
  };

  // Save to database
  await saveWorkoutSession(currentSession);

  const session = currentSession;
  currentSession = null;
  sessionHeartRates = [];
  resetStepCount();

  return session;
}

export function getCurrentSession(): WorkoutSession | null {
  return currentSession;
}

// ==================== DATABASE OPERATIONS ====================

export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
  try {
    await supabase
      .from('workout_sessions')
      .insert({
        player_id: session.playerId,
        program_id: session.programId,
        day_key: session.dayKey,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime?.toISOString(),
        duration_seconds: session.duration,
        heart_rate_data: session.heartRateData,
        heart_rate_avg: session.heartRateAvg,
        heart_rate_max: session.heartRateMax,
        calories_burned: session.caloriesBurned,
        steps: session.steps,
        distance_meters: session.distance,
        source: session.source,
      });
  } catch (error) {
    console.error('Error saving workout session:', error);
  }
}

export async function saveDailyFitnessData(playerId: string, data: FitnessData): Promise<void> {
  try {
    const date = data.timestamp.toISOString().split('T')[0];
    
    await supabase
      .from('daily_fitness_data')
      .upsert({
        player_id: playerId,
        date,
        steps: data.steps,
        distance_meters: data.distance,
        calories: data.calories,
        heart_rate_avg: data.heartRateAvg,
        heart_rate_max: data.heartRateMax,
        active_minutes: data.activeMinutes,
        sleep_hours: data.sleepHours,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'player_id,date',
      });
  } catch (error) {
    console.error('Error saving daily fitness data:', error);
  }
}

export async function getDailyFitnessData(
  playerId: string,
  startDate: Date,
  endDate: Date
): Promise<FitnessData[]> {
  try {
    const { data, error } = await supabase
      .from('daily_fitness_data')
      .select('*')
      .eq('player_id', playerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      steps: row.steps,
      distance: row.distance_meters,
      calories: row.calories,
      heartRateAvg: row.heart_rate_avg,
      heartRateMax: row.heart_rate_max,
      activeMinutes: row.active_minutes,
      sleepHours: row.sleep_hours,
      timestamp: new Date(row.date),
    }));
  } catch (error) {
    console.error('Error getting daily fitness data:', error);
    return [];
  }
}

export async function getWorkoutSessions(
  playerId: string,
  limit: number = 10
): Promise<WorkoutSession[]> {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('player_id', playerId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      playerId: row.player_id,
      programId: row.program_id,
      dayKey: row.day_key,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      duration: row.duration_seconds,
      heartRateData: row.heart_rate_data,
      heartRateAvg: row.heart_rate_avg,
      heartRateMax: row.heart_rate_max,
      caloriesBurned: row.calories_burned,
      steps: row.steps,
      distance: row.distance_meters,
      source: row.source,
    }));
  } catch (error) {
    console.error('Error getting workout sessions:', error);
    return [];
  }
}

// ==================== TRACKER CONNECTIONS ====================

export async function saveTrackerConnection(
  playerId: string,
  connection: TrackerConnection
): Promise<void> {
  try {
    await supabase
      .from('tracker_connections')
      .upsert({
        player_id: playerId,
        provider: connection.provider,
        is_connected: connection.isConnected,
        last_sync: connection.lastSync?.toISOString(),
        permissions: connection.permissions,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'player_id,provider',
      });
  } catch (error) {
    console.error('Error saving tracker connection:', error);
  }
}

export async function getTrackerConnections(playerId: string): Promise<TrackerConnection[]> {
  try {
    const { data, error } = await supabase
      .from('tracker_connections')
      .select('*')
      .eq('player_id', playerId);

    if (error) throw error;

    return (data || []).map(row => ({
      provider: row.provider,
      isConnected: row.is_connected,
      lastSync: row.last_sync ? new Date(row.last_sync) : undefined,
      permissions: row.permissions,
    }));
  } catch (error) {
    console.error('Error getting tracker connections:', error);
    return [];
  }
}

