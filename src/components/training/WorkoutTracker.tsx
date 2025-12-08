// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Footprints, MapPin, Flame, Play, Square } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFitnessTracker } from '@/hooks/useFitnessTracker';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface WorkoutTrackerProps {
  playerId: string;
  programId?: string;
  dayKey?: string;
  onSessionEnd?: (session: any) => void;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  playerId,
  programId,
  dayKey,
  onSessionEnd,
}) => {
  const { language } = useTranslation();
  const {
    steps,
    heartRate,
    distance,
    isTracking,
    isHRConnected,
    connectHR,
    currentSession,
    startSession,
    endSession,
  } = useFitnessTracker(playerId);

  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for elapsed time
  useEffect(() => {
    if (!isTracking || !currentSession) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} м`;
    }
    return `${(meters / 1000).toFixed(2)} км`;
  };

  // Estimate calories (rough: 0.04 cal per step)
  const estimatedCalories = Math.round(steps * 0.04 + (elapsedTime / 60) * 5);

  const handleStart = () => {
    startSession(programId, dayKey);
    setElapsedTime(0);
  };

  const handleStop = async () => {
    const session = await endSession();
    if (session && onSessionEnd) {
      onSessionEnd(session);
    }
  };

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'startWorkout': { uk: 'Почати тренування', en: 'Start Workout', cs: 'Začít trénink' },
      'stopWorkout': { uk: 'Завершити', en: 'Stop Workout', cs: 'Ukončit' },
      'duration': { uk: 'Тривалість', en: 'Duration', cs: 'Doba trvání' },
      'steps': { uk: 'Кроки', en: 'Steps', cs: 'Kroky' },
      'distance': { uk: 'Дистанція', en: 'Distance', cs: 'Vzdálenost' },
      'heartRate': { uk: 'Пульс', en: 'Heart Rate', cs: 'Tep' },
      'calories': { uk: 'Калорії', en: 'Calories', cs: 'Kalorie' },
      'connectHR': { uk: "Під'єднати пульсометр", en: 'Connect HR Monitor', cs: 'Připojit měřič tepu' },
      'tracking': { uk: 'Відстеження...', en: 'Tracking...', cs: 'Sledování...' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  if (!isTracking) {
    return (
      <Card className="p-4">
        <Button
          onClick={handleStart}
          className="w-full"
          leftIcon={<Play className="w-5 h-5" />}
        >
          {getText('startWorkout')}
        </Button>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="p-4 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        {/* Timer */}
        <div className="text-center mb-4">
          <p className="text-xs text-white/70 uppercase tracking-wide mb-1">{getText('duration')}</p>
          <p className="text-4xl font-mono font-bold">{formatTime(elapsedTime)}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/70">{getText('tracking')}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Steps */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/70 mb-1">
              <Footprints className="w-4 h-4" />
              <span className="text-xs">{getText('steps')}</span>
            </div>
            <p className="text-2xl font-bold">{steps.toLocaleString()}</p>
          </div>

          {/* Distance */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/70 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">{getText('distance')}</span>
            </div>
            <p className="text-2xl font-bold">{formatDistance(distance)}</p>
          </div>

          {/* Heart Rate */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/70 mb-1">
              <Heart className={cn('w-4 h-4', heartRate && 'animate-pulse text-red-300')} />
              <span className="text-xs">{getText('heartRate')}</span>
            </div>
            {heartRate ? (
              <p className="text-2xl font-bold">{heartRate} <span className="text-sm font-normal">bpm</span></p>
            ) : isHRConnected ? (
              <p className="text-lg">--</p>
            ) : (
              <button
                onClick={connectHR}
                className="text-xs text-white/70 underline"
              >
                {getText('connectHR')}
              </button>
            )}
          </div>

          {/* Calories */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/70 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs">{getText('calories')}</span>
            </div>
            <p className="text-2xl font-bold">{estimatedCalories}</p>
          </div>
        </div>

        {/* Stop Button */}
        <Button
          onClick={handleStop}
          variant="secondary"
          className="w-full bg-white text-primary-700 hover:bg-gray-100"
          leftIcon={<Square className="w-5 h-5" />}
        >
          {getText('stopWorkout')}
        </Button>
      </Card>
    </motion.div>
  );
};

export default WorkoutTracker;

