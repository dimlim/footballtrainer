import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-700 border-gray-200',
      success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      danger: 'bg-rose-100 text-rose-700 border-rose-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    const sizes = {
      sm: 'text-[10px] px-1.5 py-0.5',
      md: 'text-xs px-2 py-0.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-bold rounded-full border uppercase tracking-wide',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Intensity Badge (specific for training)
interface IntensityBadgeProps {
  level: 'low' | 'medium' | 'high';
  labels?: {
    low: string;
    medium: string;
    high: string;
  };
}

export const IntensityBadge: React.FC<IntensityBadgeProps> = ({ 
  level, 
  labels = { low: 'Low', medium: 'Medium', high: 'High' } 
}) => {
  const variants = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  } as const;

  return (
    <Badge variant={variants[level]} size="sm">
      {labels[level]}
    </Badge>
  );
};

