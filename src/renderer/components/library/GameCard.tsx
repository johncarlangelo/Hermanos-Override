import React, { useState } from 'react';
import type { GameWithStatus } from '../../../shared/types';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { formatPath } from '../../lib/utils';
import { useLibrary } from '../../context/LibraryContext';
import {
  Play,
  Square,
  FileCode2,
  Gamepad2,
  FolderOpen,
  Edit2,
  Trash2,
  Link2,
  AlertCircle
} from 'lucide-react';

interface GameCardProps {
  game: GameWithStatus;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { launchTrainer, stopTrainer, setEditingGame, setDeletingGame } = useLibrary();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [iconLoadFailed, setIconLoadFailed] = useState(false);

  const handlePrimaryAction = async () => {
    setIsActionLoading(true);
    try {
      if (game.status === 'ready') {
        await launchTrainer(game.id);
      } else if (game.status === 'trainer_running') {
        await stopTrainer(game.id);
      } else if (
        game.status === 'no_trainer' ||
        game.status === 'missing_trainer' ||
        game.status === 'missing_game'
      ) {
        setEditingGame(game);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderPrimaryButton = () => {
    switch (game.status) {
      case 'ready':
        return (
          <Button
            variant="success"
            size="sm"
            className="flex-1 font-semibold"
            isLoading={isActionLoading}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            onClick={handlePrimaryAction}
          >
            Activate Trainer
          </Button>
        );
      case 'trainer_running':
        return (
          <Button
            variant="danger"
            size="sm"
            className="flex-1 font-semibold"
            isLoading={isActionLoading}
            leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
            onClick={handlePrimaryAction}
          >
            Stop Trainer
          </Button>
        );
      case 'missing_game':
        return (
          <Button
            variant="warning"
            size="sm"
            className="flex-1 font-medium"
            leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
            onClick={handlePrimaryAction}
          >
            Relink Game
          </Button>
        );
      case 'missing_trainer':
        return (
          <Button
            variant="warning"
            size="sm"
            className="flex-1 font-medium"
            leftIcon={<Link2 className="w-3.5 h-3.5" />}
            onClick={handlePrimaryAction}
          >
            Relink Trainer
          </Button>
        );
      case 'no_trainer':
      default:
        return (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 font-medium"
            leftIcon={<FolderOpen className="w-3.5 h-3.5" />}
            onClick={handlePrimaryAction}
          >
            Link Trainer
          </Button>
        );
    }
  };

  return (
    <div className="group relative flex flex-col justify-between p-4.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-slate-400/40 dark:hover:border-slate-700 transition-all duration-200 shadow-xs hover:shadow-md">
      {/* Header with Title and Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 overflow-hidden">
              {game.iconPath && !iconLoadFailed ? (
                <img
                  src={`app-asset://${encodeURIComponent(game.iconPath)}`}
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={() => setIconLoadFailed(true)}
                />
              ) : (
                <Gamepad2 className="w-5 h-5 text-[var(--text-muted)]" />
              )}
            </div>
            <div className="min-w-0">
              <h3
                className="text-sm font-bold text-[var(--text-primary)] truncate"
                title={game.name}
              >
                {game.name}
              </h3>
              <p
                className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1 mt-0.5"
                title={game.gameExePath}
              >
                <FileCode2 className="w-3 h-3 shrink-0" />
                <span>{formatPath(game.gameExePath)}</span>
              </p>
            </div>
          </div>

          <StatusBadge status={game.status} />
        </div>

        {/* Path details */}
        <div className="mt-3 pt-3 border-t border-[var(--border-color)]/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)] font-medium">Trainer:</span>
            <span
              className="truncate max-w-[170px] font-mono text-[11px] text-[var(--text-secondary)]"
              title={game.trainerExePath || 'None configured'}
            >
              {game.trainerExePath ? formatPath(game.trainerExePath) : 'None'}
            </span>
          </div>

          {game.trainerPid && (
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)] font-medium">Process PID:</span>
              <span className="font-mono text-[11px] text-blue-500 font-semibold">
                {game.trainerPid}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
        {renderPrimaryButton()}

        <button
          onClick={() => setEditingGame(game)}
          title="Edit game configuration"
          aria-label="Edit game"
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setDeletingGame(game)}
          title="Remove game from library"
          aria-label="Delete game"
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
