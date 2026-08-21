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
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />
  };

  const bgStyles = {
    success: 'bg-[var(--bg-secondary)] border-[var(--border-color)] border-l-4 border-l-emerald-500 text-[var(--text-primary)]',
    error: 'bg-[var(--bg-secondary)] border-[var(--border-color)] border-l-4 border-l-red-500 text-[var(--text-primary)]',
    warning: 'bg-[var(--bg-secondary)] border-[var(--border-color)] border-l-4 border-l-amber-500 text-[var(--text-primary)]',
    info: 'bg-[var(--bg-secondary)] border-[var(--border-color)] border-l-4 border-l-blue-500 text-[var(--text-primary)]'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl max-w-md',
          bgStyles[notification.type || 'info']
        )}
      >
        {iconMap[notification.type || 'info']}
        <p className="text-sm font-medium flex-1">{notification.message}</p>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
