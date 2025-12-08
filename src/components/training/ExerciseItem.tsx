import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Info, AlertTriangle, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { ExerciseTimer } from './ExerciseTimer';
import { activityLogger } from '@/lib/activityLogger';
import { useAuthStore } from '@/stores/authStore';

interface ExerciseItemProps {
  id: string;
  dayKey: string;
  title: string;
  description?: string[];
  sets?: string;
  reps?: string;
  restSeconds?: number;
  type: 'checkbox' | 'input' | 'timer';
  inputLabel?: string;
  note?: string;
  timerDuration?: number;
  expectedDurationSeconds?: number; // For verification
  videoUrl?: string; // Video instruction URL
  isCompleted: boolean;
  measurementValue?: string;
  onToggle: () => void;
  onSaveMeasurement: (value: string) => void;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  id,
  dayKey,
  title,
  description,
  sets,
  reps,
  restSeconds,
  type,
  inputLabel,
  note,
  timerDuration,
  expectedDurationSeconds,
  videoUrl,
  isCompleted,
  measurementValue,
  onToggle,
  onSaveMeasurement,
}) => {
  const { t, language } = useTranslation();
  const { profile } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const hasStartedTimer = useRef(false);

  // Start timing when exercise is expanded (user starts working on it)
  useEffect(() => {
    if (isExpanded && !isCompleted && profile?.id && !hasStartedTimer.current) {
      hasStartedTimer.current = true;
      setStartedAt(new Date());
      
      // Calculate expected duration: timer duration or estimate from sets/reps
      const expectedDuration = expectedDurationSeconds || timerDuration || 
        (sets ? parseInt(sets) * 30 : 60); // Default 30s per set or 60s
      
      activityLogger.startExerciseTimer(
        profile.id,
        id,
        dayKey,
        expectedDuration
      );
    }
  }, [isExpanded, isCompleted, profile?.id, id, dayKey, expectedDurationSeconds, timerDuration, sets]);

  // Handle toggle with verification
  const handleToggle = async () => {
    if (!isCompleted && profile?.id && startedAt) {
      // Complete the exercise timer
      const result = await activityLogger.completeExerciseTimer(
        profile.id,
        id,
        dayKey
      );
      
      if (result.isSuspicious) {
        setIsSuspicious(true);
        // Still allow completion but flag it
        console.warn(`Suspicious activity: Exercise ${id} completed in ${result.actualDuration}s`);
      }
    }
    
    onToggle();
  };
  
  // Format duration based on language
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const minLabel = language === 'uk' ? 'хв' : language === 'cs' ? 'min' : 'min';
    return `${mins} ${minLabel}`;
  };
  
  const formatRest = (seconds: number) => {
    const secLabel = language === 'uk' ? 'с' : language === 'cs' ? 's' : 's';
    return `${seconds}${secLabel}`;
  };

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border-2 mb-3 transition-all overflow-hidden",
        isCompleted 
          ? "bg-success-50 border-success-200" 
          : "bg-white border-gray-100",
        isExpanded && "shadow-lg border-primary-200 ring-2 ring-primary-100"
      )}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={cn(
              "mt-0.5 min-w-7 min-h-7 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
              isCompleted
                ? "bg-success-500 border-success-500 text-white"
                : "border-gray-300 text-transparent hover:border-success-400 bg-white"
            )}
          >
            <Check size={16} strokeWidth={3} />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <h4 className={cn(
                "font-semibold text-gray-900 leading-tight",
                isCompleted && "text-success-700 line-through opacity-70"
              )}>
                {title}
              </h4>
              <div className="flex items-center gap-2 shrink-0">
                {reps && (
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                    {reps}
                  </span>
                )}
                <ChevronDown 
                  size={18} 
                  className={cn(
                    "text-gray-400 transition-transform",
                    isExpanded && "rotate-180"
                  )} 
                />
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              {sets && (
                <span className="flex items-center gap-1">
                  🔄 {sets}
                </span>
              )}
              {timerDuration && (
                <span className="flex items-center gap-1">
                  ⏱️ {formatDuration(timerDuration)}
                </span>
              )}
              {restSeconds && (
                <span className="flex items-center gap-1">
                  ⏸️ {t('training.rest')}: {formatRest(restSeconds)}
                </span>
              )}
              {videoUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVideo(true);
                  }}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Play size={14} className="fill-current" />
                  {language === 'uk' ? 'Відео' : language === 'cs' ? 'Video' : 'Video'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 pt-3 bg-gray-50/50">
              {/* Description steps */}
              {description && description.length > 0 && (
                <div className="space-y-2 mb-4">
                  {description.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="min-w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Note/Tip */}
              {note && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-2 text-sm text-amber-800 mb-4">
                  <Info size={18} className="shrink-0 text-amber-600 mt-0.5" />
                  <span className="font-medium">{note}</span>
                </div>
              )}

              {/* Suspicious activity warning */}
              {isSuspicious && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 text-sm text-red-800 mb-4">
                  <AlertTriangle size={18} className="shrink-0 text-red-600 mt-0.5" />
                  <span className="font-medium">
                    {language === 'uk' 
                      ? 'Вправа виконана занадто швидко. Тренер може перевірити.' 
                      : language === 'cs'
                      ? 'Cvičení dokončeno příliš rychle. Trenér může zkontrolovat.'
                      : 'Exercise completed too fast. Coach may verify.'}
                  </span>
                </div>
              )}

              {/* Timer */}
              {timerDuration && (
                <ExerciseTimer 
                  duration={timerDuration} 
                  onComplete={() => {
                    if (!isCompleted) {
                      handleToggle();
                    }
                  }}
                />
              )}

              {/* Input for measurements */}
              {type === 'input' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-600">
                      {inputLabel || t('training.result')}:
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={measurementValue || ''}
                      onChange={(e) => onSaveMeasurement(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-28 p-2.5 text-right border-2 border-gray-200 rounded-xl text-lg font-bold 
                                 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
                                 bg-white transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Video player */}
              <div className="aspect-video">
                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={getYouTubeEmbedUrl(videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Title */}
              <div className="p-4 bg-gray-900">
                <h3 className="text-white font-semibold">{title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
  let videoId = '';
  
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

