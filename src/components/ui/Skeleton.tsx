import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
};

// Preset skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')} 
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md',
  className 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton variant="circular" className={cn(sizes[size], className)} />;
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4', className)}>
    <div className="flex items-center gap-3">
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton variant="rounded" className={cn('h-10 w-24', className)} />
);

// Program card skeleton
export const SkeletonProgramCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl overflow-hidden', className)}>
    <Skeleton variant="rectangular" className="h-32 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="h-5 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" className="h-6 w-16" />
        <Skeleton variant="rounded" className="h-6 w-16" />
      </div>
    </div>
  </div>
);

// Exercise item skeleton
export const SkeletonExercise: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl', className)}>
    <Skeleton variant="circular" className="w-10 h-10" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="h-4 w-2/3" />
      <Skeleton variant="text" className="h-3 w-1/3" />
    </div>
    <Skeleton variant="circular" className="w-6 h-6" />
  </div>
);

// Stats card skeleton
export const SkeletonStats: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('grid grid-cols-2 gap-4', className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2">
        <Skeleton variant="text" className="h-3 w-1/2" />
        <Skeleton variant="text" className="h-8 w-3/4" />
      </div>
    ))}
  </div>
);

// List skeleton
export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-1/2" />
          <Skeleton variant="text" className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;

