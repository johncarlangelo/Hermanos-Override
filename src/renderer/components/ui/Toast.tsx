import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { AppNotification } from '../../../shared/types';

export interface ToastProps {
  notifications: AppNotification[];
  onDismiss: (id: number) => void;
  duration?: number;
}

const iconMap = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-sky-400 shrink-0" />
};

const bgStyles = {
  success: 'border-emerald-500/30 bg-emerald-950/50 text-emerald-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(16,185,129,0.2)]',
  error: 'border-rose-500/30 bg-rose-950/50 text-rose-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(244,63,94,0.2)]',
  warning: 'border-amber-500/30 bg-amber-950/50 text-amber-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(245,158,11,0.2)]',
  info: 'border-sky-500/30 bg-sky-950/50 text-sky-100 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.2)]'
};

const ToastItem: React.FC<{
  notification: AppNotification;
  onDismiss: (id: number) => void;
  duration: number;
}> = ({ notification, onDismiss, duration }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss, duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', damping: 24, stiffness: 350 }}
      className={cn(
        'flex items-center gap-3 px-4.5 py-3.5 rounded-2xl border backdrop-blur-xl max-w-md shadow-2xl pointer-events-auto',
        bgStyles[notification.type || 'info']
      )}
    >
      {iconMap[notification.type || 'info']}
      <p className="text-sm font-medium flex-1 text-slate-100">{notification.message}</p>
      <button
        onClick={() => onDismiss(notification.id)}
        aria-label="Dismiss toast"
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export const Toast: React.FC<ToastProps> = ({
  notifications,
  onDismiss,
  duration = 4000
}) => {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-2 items-end"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
            duration={duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
