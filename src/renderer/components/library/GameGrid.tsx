import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '../../context/LibraryContext';
import { GameCard } from './GameCard';
import { EmptyLibrary } from './EmptyLibrary';
import { Button } from '../ui/Button';
import { SearchX, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { StatusFilter } from '../../../shared/types';

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'ready', label: 'Ready' },
  { key: 'running', label: 'Running' },
  { key: 'missing', label: 'Missing' }
];

const StatusFilterBar: React.FC = () => {
  const { games, statusFilter, setStatusFilter } = useLibrary();

  const counts: Record<StatusFilter, number> = {
    all: games.length,
    ready: games.filter((g) => g.status === 'ready').length,
    running: games.filter((g) => g.status === 'trainer_running').length,
    missing: games.filter(
      (g) => g.status === 'missing_game' || g.status === 'missing_trainer'
    ).length
  };

  return (
    <div className="mb-5 flex items-center gap-2 flex-wrap">
      <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-500 mr-1 font-sans">
        Filter:
      </span>
      {FILTERS.map(({ key, label }) => {
        const active = statusFilter === key;
        return (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            aria-pressed={active}
            className={cn(
              'px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 cursor-pointer flex items-center gap-1.5',
              active
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:border-white/20'
            )}
          >
            {label}
            <span
              className={cn(
                'font-mono text-[10px] px-1.5 rounded',
                active ? 'bg-sky-500/20 text-sky-200' : 'bg-white/[0.06] text-slate-500'
              )}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export const GameGrid: React.FC = () => {
  const { games, filteredGames, searchQuery, setSearchQuery, setStatusFilter, isLoading, error, refreshGames } = useLibrary();

  if (isLoading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Decrypting Library Vault...
        </p>
      </div>
    );
  }

  // Handle storage/load failure
  if (error && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-in fade-in">
        <div className="rounded-3xl p-1 bg-white/[0.02] border border-rose-500/30 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="rounded-[calc(1.5rem-2px)] bg-[#0e1017]/90 backdrop-blur-xl p-8 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              Unable to load game library
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
              {error}
            </p>
            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => refreshGames()}
              >
                Retry Loading
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return <EmptyLibrary />;
  }

  if (filteredGames.length === 0) {
    return (
      <div>
        <StatusFilterBar />
        <div className="flex flex-col items-center justify-center min-h-[45vh] p-6 text-center animate-in fade-in">
        <div className="rounded-3xl p-1 bg-white/[0.02] border border-white/10 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="rounded-[calc(1.5rem-2px)] bg-[#0b101c]/80 backdrop-blur-xl p-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <SearchX className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {searchQuery
                ? <>No games matching &quot;{searchQuery}&quot;</>
                : 'No games match the current filter'}
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-xs">
              Try a different keyword or adjust your filters.
            </p>
            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatusFilterBar />
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
