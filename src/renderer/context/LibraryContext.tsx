import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from 'react';
import type {
  GameWithStatus,
  CreateGameInput,
  UpdateGameInput,
  TrainerStatusChangeEvent,
  AppNotification,
  StatusFilter
} from '../../shared/types';

interface LibraryContextType {
  games: GameWithStatus[];
  filteredGames: GameWithStatus[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  isLoading: boolean;
  error: string | null;
  notifications: AppNotification[];
  dismissNotification: (id: number) => void;
  refreshGames: () => Promise<void>;
  createGame: (input: CreateGameInput) => Promise<GameWithStatus>;
  updateGame: (id: string, input: UpdateGameInput) => Promise<GameWithStatus>;
  deleteGame: (id: string) => Promise<boolean>;
  launchTrainer: (gameId: string) => Promise<boolean>;
  stopTrainer: (gameId: string) => Promise<boolean>;
  exportLibrary: () => Promise<LibraryIOResultLike>;
  importLibrary: () => Promise<LibraryIOResultLike>;

  // Modal states
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingGame: GameWithStatus | null;
  setEditingGame: (game: GameWithStatus | null) => void;
  deletingGame: GameWithStatus | null;
  setDeletingGame: (game: GameWithStatus | null) => void;
}

type LibraryIOResultLike = {
  success: boolean;
  count?: number;
  path?: string;
  canceled?: boolean;
  error?: string;
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<GameWithStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const nextNotificationId = useRef(0);

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameWithStatus | null>(null);
  const [deletingGame, setDeletingGame] = useState<GameWithStatus | null>(null);

  /** Queue a toast notification (stacked, auto-dismissed by the Toast UI). */
  const notify = useCallback(
    (type: AppNotification['type'], message: string): number => {
      const id = ++nextNotificationId.current;
      setNotifications((prev) => [...prev.slice(-4), { id, type, message }]);
      return id;
    },
    []
  );

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refreshGames = useCallback(async () => {
    if (!window.electronAPI) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const list = await window.electronAPI.listGames();
      setGames(list);
    } catch (err: any) {
      console.error('Failed to load games:', err);
      setError(err?.message || 'Failed to load game library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGames();
  }, [refreshGames]);

  // Re-evaluate dynamic status when the window regains focus. Files may have
  // been moved, renamed or deleted while the app was in the background.
  useEffect(() => {
    const handleFocus = () => {
      refreshGames();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleFocus();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshGames]);

  // Listen for trainer status change events from the main process
  useEffect(() => {
    if (!window.electronAPI?.onTrainerStatusChange) return;

    const cleanup = window.electronAPI.onTrainerStatusChange(
      (event: TrainerStatusChangeEvent) => {
        setGames((prev) =>
          prev.map((game) => {
            if (game.id === event.gameId) {
              return {
                ...game,
                status: event.status,
                trainerPid: event.pid
              };
            }
            return game;
          })
        );

        if (event.unexpectedExit) {
          notify('error', event.error || 'Trainer process exited unexpectedly.');
          refreshGames();
        }
      }
    );

    return cleanup;
  }, [refreshGames, notify]);

  const createGame = async (input: CreateGameInput): Promise<GameWithStatus> => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    try {
      const created = await window.electronAPI.createGame(input);
      setGames((prev) => [...prev, created]);
      notify('success', `Added "${created.name}" to library.`);
      return created;
    } catch (err: any) {
      notify('error', err?.message || 'Failed to create game');
      throw err;
    }
  };

  const updateGame = async (
    id: string,
    input: UpdateGameInput
  ): Promise<GameWithStatus> => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    try {
      const updated = await window.electronAPI.updateGame(id, input);
      setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
      notify('success', `Updated "${updated.name}".`);
      return updated;
    } catch (err: any) {
      notify('error', err?.message || 'Failed to update game');
      throw err;
    }
  };

  const deleteGame = async (id: string): Promise<boolean> => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    try {
      const target = games.find((g) => g.id === id);
      const success = await window.electronAPI.deleteGame(id);
      if (success) {
        setGames((prev) => prev.filter((g) => g.id !== id));
        notify(
          'info',
          target ? `Removed "${target.name}" from library.` : 'Game removed.'
        );
      }
      return success;
    } catch (err: any) {
      notify('error', err?.message || 'Failed to delete game');
      throw err;
    }
  };

  const launchTrainer = async (gameId: string): Promise<boolean> => {
    if (!window.electronAPI) return false;
    try {
      const result = await window.electronAPI.launchTrainer(gameId);
      if (result.success) {
        setGames((prev) =>
          prev.map((g) =>
            g.id === gameId
              ? { ...g, status: 'trainer_running', trainerPid: result.pid }
              : g
          )
        );
        return true;
      } else {
        notify('error', result.error || 'Failed to launch trainer');
        return false;
      }
    } catch (err: any) {
      notify('error', err?.message || 'An error occurred launching trainer');
      return false;
    }
  };

  const stopTrainer = async (gameId: string): Promise<boolean> => {
    if (!window.electronAPI) return false;
    try {
      const result = await window.electronAPI.stopTrainer(gameId);
      if (result.success) {
        // Refresh this game's status
        const statusInfo = await window.electronAPI.getGameStatus(gameId);
        setGames((prev) =>
          prev.map((g) =>
            g.id === gameId
              ? { ...g, status: statusInfo.status, trainerPid: undefined }
              : g
          )
        );
        return true;
      } else {
        notify('error', result.error || 'Failed to stop trainer');
        return false;
      }
    } catch (err: any) {
      notify('error', err?.message || 'An error occurred stopping trainer');
      return false;
    }
  };

  const exportLibrary = async (): Promise<LibraryIOResultLike> => {
    if (!window.electronAPI?.exportLibrary) {
      return { success: false, error: 'Electron API not available' };
    }
    const result = await window.electronAPI.exportLibrary();
    if (result.success) {
      notify(
        'success',
        `Exported ${result.count} game${result.count === 1 ? '' : 's'} to library backup.`
      );
    } else if (!result.canceled) {
      notify('error', result.error || 'Failed to export library');
    }
    return result;
  };

  const importLibrary = async (): Promise<LibraryIOResultLike> => {
    if (!window.electronAPI?.importLibrary) {
      return { success: false, error: 'Electron API not available' };
    }
    const result = await window.electronAPI.importLibrary();
    if (result.success) {
      await refreshGames();
      notify(
        'success',
        `Imported ${result.count} game${result.count === 1 ? '' : 's'}. Library replaced.`
      );
    } else if (!result.canceled) {
      notify('error', result.error || 'Failed to import library');
    }
    return result;
  };

  // Filtered games based on search query + status filter, alphabetically sorted
  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let matches = query
      ? games.filter((g) => g.name.toLowerCase().includes(query))
      : games;

    if (statusFilter !== 'all') {
      matches = matches.filter((g) => {
        switch (statusFilter) {
          case 'ready':
            return g.status === 'ready';
          case 'running':
            return g.status === 'trainer_running';
          case 'missing':
            return g.status === 'missing_game' || g.status === 'missing_trainer';
        }
      });
    }

    return [...matches].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }, [games, searchQuery, statusFilter]);

  return (
    <LibraryContext.Provider
      value={{
        games,
        filteredGames,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        isLoading,
        error,
        notifications,
        dismissNotification,
        refreshGames,
        createGame,
        updateGame,
        deleteGame,
        launchTrainer,
        stopTrainer,
        exportLibrary,
        importLibrary,
        isAddModalOpen,
        setIsAddModalOpen,
        editingGame,
        setEditingGame,
        deletingGame,
        setDeletingGame
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
