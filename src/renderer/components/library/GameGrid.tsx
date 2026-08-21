import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { GameCard } from './GameCard';
import { EmptyLibrary } from './EmptyLibrary';
import { Button } from '../ui/Button';
import { SearchX, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const GameGrid: React.FC = () => {
  const { games, filteredGames, searchQuery, setSearchQuery, isLoading, error, refreshGames } = useLibrary();

  if (isLoading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-[var(--text-secondary)] font-medium">
          Loading your game library...
        </p>
      </div>
    );
  }

  // Handle critical storage/load failure
  if (error && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          Unable to load game library
        </h3>
        <p className="mt-1.5 text-xs text-[var(--text-secondary)] max-w-md">
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
    );
  }

  if (games.length === 0) {
    return <EmptyLibrary />;
  }

  if (filteredGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center animate-in fade-in">
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          No games matching "{searchQuery}"
        </h3>
        <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm">
          Check the spelling or try searching with a different term.
        </p>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {filteredGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};
