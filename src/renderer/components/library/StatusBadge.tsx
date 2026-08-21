import React from 'react';
import type { GameStatus } from '../../../shared/types';
import { Badge } from '../ui/Badge';

interface StatusBadgeProps {
  status: GameStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'ready':
      return (
        <Badge variant="ready" dot className={className}>
          Ready
        </Badge>
      );
    case 'trainer_running':
      return (
        <Badge variant="running" dot className={className}>
          Trainer Running
        </Badge>
      );
    case 'missing_trainer':
      return (
        <Badge variant="warning" dot className={className}>
          Missing Trainer
        </Badge>
      );
    case 'missing_game':
      return (
        <Badge variant="danger" dot className={className}>
          Missing Game
        </Badge>
      );
    case 'no_trainer':
    default:
      return (
        <Badge variant="neutral" dot className={className}>
          No Trainer Yet
        </Badge>
      );
  }
};
