import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useLibrary } from '../../context/LibraryContext';
import { Folder, Gamepad2, FileCode, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import type { CreateGameInput, UpdateGameInput, GameWithStatus } from '../../../shared/types';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: GameWithStatus | null;
}

export const GameModal: React.FC<GameModalProps> = ({
  isOpen,
  onClose,
  gameToEdit
}) => {
  const { createGame, updateGame } = useLibrary();

  const [name, setName] = useState('');
  const [gameExePath, setGameExePath] = useState('');
  const [trainerExePath, setTrainerExePath] = useState('');
  const [iconPath, setIconPath] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(gameToEdit);

  useEffect(() => {
    if (gameToEdit) {
      setName(gameToEdit.name);
      setGameExePath(gameToEdit.gameExePath);
      setTrainerExePath(gameToEdit.trainerExePath || '');
      setIconPath(gameToEdit.iconPath || '');
    } else {
      setName('');
      setGameExePath('');
      setTrainerExePath('');
      setIconPath('');
    }
    setErrors({});
  }, [gameToEdit, isOpen]);

  const handleBrowseGameExe = async () => {
    if (!window.electronAPI) return;
    try {
      const selected = await window.electronAPI.selectFile({
        title: 'Select Game Executable',
        filterName: 'Executable (.exe)',
        extensions: ['exe']
      });

      if (selected) {
        setGameExePath(selected);
        setErrors((prev) => ({ ...prev, gameExePath: '' }));

        // If name is empty, auto-populate from filename
        if (!name.trim()) {
          const fileName = selected.split(/[/\\]/).pop() || '';
          const cleanName = fileName.replace(/\.exe$/i, '');
          setName(cleanName);
          setErrors((prev) => ({ ...prev, name: '' }));
        }
      }
    } catch (err) {
      console.error('Failed to open file picker:', err);
    }
  };

  const handleBrowseTrainerExe = async () => {
    if (!window.electronAPI) return;
    try {
      const selected = await window.electronAPI.selectFile({
        title: 'Select Trainer Executable',
        filterName: 'Executable (.exe)',
        extensions: ['exe']
      });

      if (selected) {
        setTrainerExePath(selected);
      }
    } catch (err) {
      console.error('Failed to open file picker:', err);
    }
  };

  const handleBrowseIcon = async () => {
    if (!window.electronAPI) return;
    try {
      const selected = await window.electronAPI.selectFile({
        title: 'Select Game Icon',
        filterName: 'Images (.png, .jpg, .ico)',
        extensions: ['png', 'jpg', 'jpeg', 'ico']
      });

      if (selected) {
        setIconPath(selected);
      }
    } catch (err) {
      console.error('Failed to open file picker:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Game name is required';
    }
    if (!gameExePath.trim()) {
      newErrors.gameExePath = 'Game executable path is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && gameToEdit) {
        const updateInput: UpdateGameInput = {
          name: name.trim(),
          gameExePath: gameExePath.trim(),
          trainerExePath: trainerExePath.trim() || null,
          iconPath: iconPath.trim() || null
        };
        await updateGame(gameToEdit.id, updateInput);
      } else {
        const createInput: CreateGameInput = {
          name: name.trim(),
          gameExePath: gameExePath.trim(),
          trainerExePath: trainerExePath.trim() || undefined,
          iconPath: iconPath.trim() || undefined
        };
        await createGame(createInput);
      }
      onClose();
    } catch (err) {
      console.error('Form submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Game' : 'Add New Game'}
      description={
        isEditing
          ? 'Update game details and executable paths.'
          : 'Link a local single-player PC game and its trainer executable.'
      }
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Add Game'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contextual Banner for Missing Game / Trainer */}
        {gameToEdit?.status === 'missing_game' && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              <strong>Missing Game Executable:</strong> The configured game .exe file was not found on your system. Please locate the new file path below.
            </p>
          </div>
        )}

        {gameToEdit?.status === 'missing_trainer' && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              <strong>Missing Trainer Executable:</strong> The configured trainer .exe file was not found at its path. Please select the updated location or clear the field.
            </p>
          </div>
        )}

        {/* Game Name */}
        <Input
          label="Game Name *"
          placeholder="e.g. Cyberpunk 2077, Elden Ring"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          leftIcon={<Gamepad2 className="w-4 h-4" />}
          autoFocus
        />

        {/* Game Executable Path */}
        <Input
          label="Game Executable (.exe) *"
          placeholder="D:\Games\ExampleGame\game.exe"
          value={gameExePath}
          onChange={(e) => {
            setGameExePath(e.target.value);
            if (errors.gameExePath) setErrors((prev) => ({ ...prev, gameExePath: '' }));
          }}
          error={errors.gameExePath}
          leftIcon={<FileCode className="w-4 h-4" />}
          rightAction={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Folder className="w-3.5 h-3.5" />}
              onClick={handleBrowseGameExe}
            >
              Browse
            </Button>
          }
        />

        {/* Trainer Executable Path */}
        <Input
          label="Trainer Executable (.exe) (Optional)"
          placeholder="D:\Trainers\ExampleTrainer.exe"
          value={trainerExePath}
          onChange={(e) => setTrainerExePath(e.target.value)}
          helperText="Select the standalone trainer .exe to launch alongside this game."
          leftIcon={<FileCode className="w-4 h-4" />}
          rightAction={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Folder className="w-3.5 h-3.5" />}
              onClick={handleBrowseTrainerExe}
            >
              Browse
            </Button>
          }
        />

        {/* Custom Icon Path */}
        <Input
          label="Game Icon (Optional)"
          placeholder="Path to icon or image (.png, .ico, .jpg)"
          value={iconPath}
          onChange={(e) => setIconPath(e.target.value)}
          leftIcon={<ImageIcon className="w-4 h-4" />}
          rightAction={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Folder className="w-3.5 h-3.5" />}
              onClick={handleBrowseIcon}
            >
              Browse
            </Button>
          }
        />
      </form>
    </Modal>
  );
};
