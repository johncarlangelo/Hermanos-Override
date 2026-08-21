import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'ready' | 'running' | 'warning' | 'danger' | 'neutral';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    ready: 'bg-[var(--status-ready-bg)] text-[var(--status-ready-text)] border-[var(--status-ready-border)]',
    running: 'bg-[var(--status-running-bg)] text-[var(--status-running-text)] border-[var(--status-running-border)]',
    warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]',
    danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)]',
    neutral: 'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)] border-[var(--status-neutral-border)]'
  };

  const dotStyles = {
    ready: 'bg-emerald-500',
    running: 'bg-blue-500 animate-ping',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    neutral: 'bg-slate-400'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {variant === 'running' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          )}
          <span
            className={cn('relative inline-flex rounded-full h-2 w-2', dotStyles[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
};
