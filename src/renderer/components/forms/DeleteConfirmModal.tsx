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
      title="Remove Game Configuration"
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
            Remove Record
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0 shadow-[0_0_16px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-white">&ldquo;{game.name}&rdquo;</span> from Hermanos Override?
            </p>
          </div>
        </div>

        {/* Disk Safety Guarantee Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.12)]">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white font-semibold">Disk Safety Guarantee:</strong> This action only removes the entry from your local library configuration. It will <strong className="text-white">never</strong> delete, move, or modify any executable files on your hard drive.
          </p>
        </div>
      </div>
    </Modal>
  );
};
