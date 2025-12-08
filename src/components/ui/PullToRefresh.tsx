import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  threshold = 80,
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pullDistance = useMotionValue(0);
  
  const indicatorY = useTransform(pullDistance, [0, threshold], ['-100%', '0%']);
  const indicatorOpacity = useTransform(pullDistance, [0, threshold / 2, threshold], [0, 0.5, 1]);
  const indicatorRotation = useTransform(pullDistance, [0, threshold], [0, 180]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      pullDistance.set(0);
      return;
    }
    
    const currentY = e.touches[0].clientY;
    const diff = Math.max(0, (currentY - startY.current) * 0.5); // Resistance factor
    
    pullDistance.set(Math.min(diff, threshold * 1.5));
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    
    if (pullDistance.get() >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      animate(pullDistance, threshold, { duration: 0.2 });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        animate(pullDistance, 0, { duration: 0.3 });
      }
    } else {
      animate(pullDistance, 0, { duration: 0.3 });
    }
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
        style={{ 
          y: indicatorY,
          opacity: indicatorOpacity,
          height: threshold 
        }}
      >
        <motion.div
          className={cn(
            'w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center',
            isRefreshing && 'animate-spin'
          )}
          style={{ rotate: isRefreshing ? undefined : indicatorRotation }}
        >
          <Loader2 className="w-5 h-5 text-primary-500" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-auto"
        style={{ y: useTransform(pullDistance, [0, threshold], [0, threshold / 2]) }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;

