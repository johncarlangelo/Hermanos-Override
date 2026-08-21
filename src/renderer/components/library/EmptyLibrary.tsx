import React from 'react';
import { Button } from '../ui/Button';
import { useLibrary } from '../../context/LibraryContext';
import { Gamepad2, Plus, Sparkles } from 'lucide-react';

export const EmptyLibrary: React.FC = () => {
  const { setIsAddModalOpen } = useLibrary();

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] p-6 text-center animate-in fade-in zoom-in-95 duration-300">
      {/* Frosted Double-Bezel Container */}
      <div className="rounded-3xl p-1 bg-white/[0.02] border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_40px_rgba(56,189,248,0.08)] max-w-lg w-full">
        <div className="rounded-[calc(1.5rem-2px)] bg-[#0b101c]/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col items-center">
          {/* Glowing Center Glass Icon */}
          <div className="relative mb-6">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-sky-500/20 to-blue-600/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Gamepad2 className="w-8 h-8" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-mono uppercase tracking-widest mb-3">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Vault Empty</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-wide">
            No games in your library yet
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            Hermanos Override is your local trainer control console. Register your single-player PC games and link your standalone trainers to activate and track them.
          </p>

          <div className="mt-7">
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
      </div>
    </div>
  );
};
