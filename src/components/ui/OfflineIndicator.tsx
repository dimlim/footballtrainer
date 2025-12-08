import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, Check, Cloud } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  className,
  showWhenOnline = false,
}) => {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOffline();

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && pendingCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {(!isOnline || pendingCount > 0 || showWhenOnline) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'fixed top-0 left-0 right-0 z-50 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium',
            isOnline 
              ? pendingCount > 0 
                ? 'bg-amber-500 text-white'
                : 'bg-green-500 text-white'
              : 'bg-red-500 text-white',
            className
          )}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Оффлайн режим</span>
              {pendingCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {pendingCount} не синхронізовано
                </span>
              )}
            </>
          ) : pendingCount > 0 ? (
            <>
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
              <span>
                {isSyncing ? 'Синхронізація...' : `${pendingCount} елементів для синхронізації`}
              </span>
              {!isSyncing && (
                <button
                  onClick={syncNow}
                  className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-xs transition-colors"
                >
                  Синхронізувати
                </button>
              )}
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Онлайн</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Compact version for header
export const OfflineStatusBadge: React.FC<{ className?: string }> = ({ className }) => {
  const { isOnline, isSyncing, pendingCount } = useOffline();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {!isOnline ? (
        <div className="flex items-center gap-1 text-red-500">
          <WifiOff className="w-4 h-4" />
          <span className="text-xs font-medium">Оффлайн</span>
        </div>
      ) : isSyncing ? (
        <div className="flex items-center gap-1 text-amber-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">Синхронізація</span>
        </div>
      ) : pendingCount > 0 ? (
        <div className="flex items-center gap-1 text-amber-500">
          <Cloud className="w-4 h-4" />
          <span className="text-xs font-medium">{pendingCount}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-green-500">
          <Wifi className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;

