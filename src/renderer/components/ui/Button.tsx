import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
      md: 'px-4 py-2 text-sm rounded-xl gap-2',
      lg: 'px-5 py-2.5 text-base rounded-2xl gap-2.5'
    };

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:from-sky-600 active:to-blue-700 text-white font-medium shadow-[0_4px_20px_rgba(2,132,199,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] border border-sky-400/40',
      secondary:
        'bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] text-slate-200 hover:text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md',
      outline:
        'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/15 active:bg-white/[0.1] backdrop-blur-sm',
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white active:bg-white/[0.1]',
      danger:
        'bg-rose-500/20 hover:bg-rose-500/30 active:bg-rose-500/40 text-rose-200 hover:text-rose-100 border border-rose-500/40 shadow-[0_0_16px_rgba(244,63,94,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md',
      success:
        'bg-emerald-500/20 hover:bg-emerald-500/30 active:bg-emerald-500/40 text-emerald-200 hover:text-emerald-100 border border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md',
      warning:
        'bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 text-amber-200 hover:text-amber-100 border border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080d] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all duration-200 active:scale-[0.98]',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
