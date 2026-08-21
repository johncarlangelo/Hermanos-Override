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
    ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    running: 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-[0_0_16px_rgba(56,189,248,0.25)]',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
    neutral: 'bg-white/[0.04] text-slate-400 border-white/10'
  };

  const dotStyles = {
    ready: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    running: 'bg-sky-400 shadow-[0_0_10px_#38bdf8]',
    warning: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    danger: 'bg-rose-400 shadow-[0_0_8px_#fb7185]',
    neutral: 'bg-slate-400'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase border backdrop-blur-md transition-all duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {variant === 'running' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          )}
          <span
            className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotStyles[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
};
