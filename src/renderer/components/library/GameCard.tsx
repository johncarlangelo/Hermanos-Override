import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  AlertCircle,
  Activity
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
            className="flex-1 font-semibold group/btn"
            isLoading={isActionLoading}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current group-hover/btn:scale-110 transition-transform" />}
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
            className="flex-1 font-semibold group/btn"
            isLoading={isActionLoading}
            leftIcon={<Square className="w-3.5 h-3.5 fill-current group-hover/btn:scale-110 transition-transform" />}
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
            leftIcon={<FolderOpen className="w-3.5 h-3.5 text-sky-400" />}
            onClick={handlePrimaryAction}
          >
            Link Trainer
          </Button>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl p-1 bg-white/[0.02] border border-white/[0.08] hover:border-sky-500/40 transition-colors duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.7),0_0_24px_rgba(56,189,248,0.15)] flex flex-col"
    >
      <div className="rounded-[calc(1rem-2px)] bg-[#0c111e]/90 backdrop-blur-xl p-4.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between flex-1">
        {/* Top Info Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Frosted Icon Thumbnail */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shrink-0 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                {game.iconPath && !iconLoadFailed ? (
                  <img
                    src={`app-asset://${encodeURIComponent(game.iconPath)}`}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={() => setIconLoadFailed(true)}
                  />
                ) : (
                  <Gamepad2 className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
                )}
              </div>
              <div className="min-w-0">
                <h3
                  className="text-sm font-bold text-white tracking-wide truncate group-hover:text-sky-200 transition-colors"
                  title={game.name}
                >
                  {game.name}
                </h3>
                <p
                  className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5 font-mono"
                  title={game.gameExePath}
                >
                  <FileCode2 className="w-3 h-3 shrink-0 text-slate-500" />
                  <span>{formatPath(game.gameExePath)}</span>
                </p>
              </div>
            </div>

            <StatusBadge status={game.status} />
          </div>

          {/* Telemetry metadata section */}
          <div className="mt-3.5 pt-3 border-t border-white/[0.06] text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[10px] uppercase font-sans font-semibold text-slate-500">Trainer:</span>
              <span
                className="truncate max-w-[170px] text-[11px] text-slate-300 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5"
                title={game.trainerExePath || 'None configured'}
              >
                {game.trainerExePath ? formatPath(game.trainerExePath) : 'None'}
              </span>
            </div>

            {game.trainerPid && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] uppercase font-sans font-semibold text-slate-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
                  Process PID:
                </span>
                <span className="text-[11px] text-sky-300 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  {game.trainerPid}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          {renderPrimaryButton()}

          <button
            onClick={() => setEditingGame(game)}
            title="Edit game configuration"
            aria-label="Edit game"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 active:scale-95 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeletingGame(game)}
            title="Remove game from library"
            aria-label="Delete game"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
