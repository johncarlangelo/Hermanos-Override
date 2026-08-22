import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Header } from './Header';
import { GameGrid } from '../library/GameGrid';
import { GameModal } from '../forms/GameModal';
import { DeleteConfirmModal } from '../forms/DeleteConfirmModal';
import { Toast } from '../ui/Toast';
import { useLibrary } from '../../context/LibraryContext';
import { HardDrive, WifiOff, ShieldCheck } from 'lucide-react';

export const Shell: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingGame,
    setEditingGame,
    deletingGame,
    setDeletingGame,
    notification,
    clearNotification
  } = useLibrary();

  const prefersReducedMotion = useReducedMotion();
  const [isAppVisible, setIsAppVisible] = useState(true);

  // Perf: the ambient light orbs are large blurred surfaces that repaint
  // continuously. Pause them whenever the window loses focus (e.g. while the
  // user is in-game) and for users who prefer reduced motion.
  useEffect(() => {
    const updateVisibility = () => {
      setIsAppVisible(document.visibilityState === 'visible' && document.hasFocus());
    };
    updateVisibility();
    window.addEventListener('focus', updateVisibility);
    window.addEventListener('blur', updateVisibility);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      window.removeEventListener('focus', updateVisibility);
      window.removeEventListener('blur', updateVisibility);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  const animateAmbient = isAppVisible && !prefersReducedMotion;

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 relative selection:bg-sky-500/30 selection:text-sky-200 overflow-hidden">
      {/* Animated Ambient Light Mesh for Dynamic Frosted Glass Refraction */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={
            animateAmbient
              ? { x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }
              : undefined
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/10 blur-[100px]"
        />
        <motion.div
          animate={
            animateAmbient
              ? { x: [0, -40, 20, 0], y: [0, 30, -30, 0], scale: [1, 1.1, 0.9, 1] }
              : undefined
          }
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
          className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]"
        />
        <motion.div
          animate={
            animateAmbient
              ? { x: [0, 25, -25, 0], y: [0, -25, 25, 0], scale: [1, 1.05, 0.95, 1] }
              : undefined
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
          className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-emerald-500/08 blur-[110px]"
        />
      </div>

      {/* Top draggable titlebar matching Windows titlebarOverlay height, padded right for window controls */}
      <div className="h-9 w-full bg-black/40 backdrop-blur-xl border-b border-white/[0.07] flex items-center justify-between px-4 pr-36 text-xs text-slate-400 app-drag-region select-none relative z-20">
        <div className="flex items-center gap-3 app-no-drag">
          <span className="font-semibold text-white tracking-wider flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            HERMANOS OVERRIDE
          </span>
          <span className="flex items-center gap-1 text-[10px] uppercase font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
            <WifiOff className="w-2.5 h-2.5 text-slate-400" />
            <span>Local & Offline</span>
          </span>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Library Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 relative z-10">
        <GameGrid />
      </main>

      {/* Frosted Glass Footer Status Bar */}
      <footer className="bg-black/30 backdrop-blur-xl border-t border-white/[0.07] px-6 py-3 text-xs text-slate-400 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-[11px]">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span>Local Vault: <strong className="text-slate-300 font-mono text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">%APPDATA%\Hermanos Override\data\</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Telemetry · 100% Sandbox Safe</span>
        </div>
      </footer>

      {/* Modals */}
      <GameModal
        isOpen={isAddModalOpen || Boolean(editingGame)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGame(null);
        }}
        gameToEdit={editingGame}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingGame)}
        onClose={() => setDeletingGame(null)}
        game={deletingGame}
      />

      {/* Notifications */}
      <Toast notification={notification} onClose={clearNotification} />
    </div>
  );
};
