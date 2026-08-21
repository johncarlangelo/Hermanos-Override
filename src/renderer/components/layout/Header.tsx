import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/Button';
import { Plus, Search, RefreshCw, X, Shield } from 'lucide-react';

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

  const isFiltering = Boolean(searchQuery.trim());

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-secondary)]/90 backdrop-blur-md border-b border-[var(--border-color)] px-6 py-3.5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Stats */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Hermanos Override
                </h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Offline Trainer Manager
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            {isFiltering ? (
              <>
                <span className="font-semibold text-[var(--text-primary)]">{filteredGames.length}</span>
                <span>of</span>
                <span className="font-semibold text-[var(--text-primary)]">{games.length}</span>
                <span>{games.length === 1 ? 'game' : 'games'}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-[var(--text-primary)]">{games.length}</span>
                <span>{games.length === 1 ? 'game' : 'games'}</span>
              </>
            )}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              aria-label="Search library"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => refreshGames()}
            disabled={isLoading}
            title="Refresh game library & status"
            aria-label="Refresh library"
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Add Game button */}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Game
          </Button>
        </div>
      </div>
    </header>
  );
};
