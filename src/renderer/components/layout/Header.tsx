import React, { useEffect, useRef } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/Button';
import { Plus, Search, RefreshCw, X, ShieldAlert } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    games,
    filteredGames,
    searchQuery,
    setSearchQuery,
    refreshGames,
    isLoading,
    setIsAddModalOpen
  } = useLibrary();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts: Ctrl+K/Cmd+K focus search, Ctrl+N/Cmd+N add game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isFiltering = Boolean(searchQuery.trim());
  const readyCount = games.filter(g => g.status === 'ready').length;
  const runningCount = games.filter(g => g.status === 'trainer_running').length;

  return (
    <header className="px-6 pt-4">
      <div className="bg-[#0b101c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 sm:px-5 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand & Telemetry */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-300/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wider font-mono">
                  Hermanos Override
                </h1>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 tracking-widest uppercase">
                  OLED Glass
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Offline Trainer Management Console
              </p>
            </div>
          </div>

          {/* Telemetry Counter Pills */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10 text-[11px] font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-500 font-sans text-[10px] uppercase font-semibold">Total:</span>
              <span className="font-bold text-white">{isFiltering ? `${filteredGames.length}/${games.length}` : games.length}</span>
            </div>
            {runningCount > 0 && (
              <div className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center gap-1.5 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                <span className="text-[10px] uppercase font-semibold font-sans">Active:</span>
                <span className="font-bold">{runningCount}</span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="text-[10px] uppercase font-semibold font-sans">Ready:</span>
              <span className="font-bold">{readyCount}</span>
            </div>
          </div>
        </div>

        {/* Search and Action Toolbar */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Frosted Glass Search bar */}
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              aria-label="Search library"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-14 py-2 text-xs bg-black/40 border border-white/10 hover:border-white/20 focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-white placeholder-slate-500 transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded pointer-events-none">
                Ctrl+K
              </span>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => refreshGames()}
            disabled={isLoading}
            title="Refresh game library & status"
            aria-label="Refresh library"
            className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 transition-all duration-200 disabled:opacity-40 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Theme Mode Indicator/Toggle */}
          <ThemeToggle />

          {/* Primary Add Game CTA */}
          <Button
            size="md"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0"
          >
            Add Game
          </Button>
        </div>
      </div>
    </header>
  );
};
