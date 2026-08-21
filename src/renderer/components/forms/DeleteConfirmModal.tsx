import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useLibrary } from '../../context/LibraryContext';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { GameWithStatus } from '../../../shared/types';

interface DeleteConfirmModalProps {
  game: GameWithStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  game,
  isOpen,
  onClose
}) => {
  const { deleteGame } = useLibrary();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!game) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteGame(game.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Game"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            Remove Game
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Are you sure you want to remove <span className="font-bold">"{game.name}"</span> from Hermanos Override?
            </p>
          </div>
        </div>

        {/* Reassurance banner for delete safety */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-[var(--text-secondary)]">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-[var(--text-primary)]">Disk Safety Guarantee:</strong> This action will only remove the library configuration. It will <strong className="text-[var(--text-primary)]">never</strong> delete or modify any executable files from your drive.
          </p>
        </div>
      </div>
    </Modal>
  );
};
