import React from 'react';
import { Button } from '../ui/Button';
import { useLibrary } from '../../context/LibraryContext';
import { Gamepad2, Plus } from 'lucide-react';

export const EmptyLibrary: React.FC = () => {
  const { setIsAddModalOpen } = useLibrary();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] mb-5 shadow-xs">
        <Gamepad2 className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
        No games in your library yet
      </h2>

      <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
        Hermanos Override is your offline trainer control center. Add your single-player PC
        games and link your local trainer executables to launch and track them seamlessly.
      </p>

      <div className="mt-6">
        <Button
          size="lg"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Your First Game
        </Button>
      </div>
    </div>
  );
};
