import React from 'react';
import { Header } from './Header';
import { GameGrid } from '../library/GameGrid';
import { GameModal } from '../forms/GameModal';
import { DeleteConfirmModal } from '../forms/DeleteConfirmModal';
import { Toast } from '../ui/Toast';
import { useLibrary } from '../../context/LibraryContext';
import { HardDrive, WifiOff } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top draggable region matching 36px titlebar overlay height, padded right for window controls */}
      <div className="h-9 w-full bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between px-4 pr-36 text-xs text-[var(--text-muted)] app-drag-region select-none">
        <div className="flex items-center gap-3 app-no-drag">
          <span className="font-semibold text-[var(--text-secondary)]">Hermanos Override</span>
          <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
            <WifiOff className="w-3 h-3 text-slate-400" />
            <span>Offline</span>
          </span>
        </div>
      </div>

      {/* Main Header Navigation */}
      <Header />

      {/* Main Library Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <GameGrid />
      </main>

      {/* Subtle Footer / Status Bar */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] px-6 py-2.5 text-xs text-[var(--text-muted)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Local Storage: <strong className="text-[var(--text-secondary)] font-mono">%APPDATA%\Hermanos Override\data\</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Windows Desktop Utility</span>
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
