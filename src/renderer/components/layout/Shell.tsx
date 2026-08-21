import React from 'react';
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

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 relative selection:bg-sky-500/30 selection:text-sky-200">
      {/* Ambient Radial Mesh Background for Frosted Glass Refraction */}
      <div className="glass-mesh-background" />

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
