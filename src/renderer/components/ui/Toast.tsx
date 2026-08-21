import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  notification: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  notification,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [notification, onClose, duration]);

  if (!notification) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />
  };

  const bgStyles = {
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(16,185,129,0.15)]',
    error: 'border-rose-500/30 bg-rose-950/40 text-rose-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(244,63,94,0.15)]',
    warning: 'border-amber-500/30 bg-amber-950/40 text-amber-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(245,158,11,0.15)]',
    info: 'border-sky-500/30 bg-sky-950/40 text-sky-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.15)]'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl max-w-md shadow-2xl',
          bgStyles[notification.type || 'info']
        )}
      >
        {iconMap[notification.type || 'info']}
        <p className="text-sm font-medium flex-1 text-slate-100">{notification.message}</p>
        <button
          onClick={onClose}
          aria-label="Dismiss toast"
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
