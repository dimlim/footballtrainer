import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';

interface ExerciseTimerProps {
  duration: number; // seconds
  onComplete?: () => void;
}

export const ExerciseTimer: React.FC<ExerciseTimerProps> = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl mt-3">
      {/* Progress bar */}
      <div className="h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
        <div 
          className="h-full bg-primary-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "font-mono text-3xl font-bold tabular-nums",
            timeLeft === 0 ? "text-green-400" : "text-primary-400"
          )}>
            {formatTime(timeLeft)}
          </div>
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
            {timeLeft === 0 ? '✓ Готово!' : 'Таймер'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTimer}
            disabled={timeLeft === 0}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full transition-all",
              isActive 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-green-500 hover:bg-green-600",
              timeLeft === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            {isActive ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

