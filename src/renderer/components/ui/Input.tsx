import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightAction, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-semibold text-slate-300 tracking-wider uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center group">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 text-sm bg-white/[0.04] backdrop-blur-md border border-white/10 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200',
              leftIcon && 'pl-10',
              rightAction && 'pr-24',
              error && 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/20 text-rose-100',
              className
            )}
            {...props}
          />
          {rightAction && (
            <div className="absolute right-2 flex items-center">
              {rightAction}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
