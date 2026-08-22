import type {
  GameWithStatus,
  CreateGameInput,
  UpdateGameInput,
  TrainerLaunchResult,
  TrainerStopResult,
  SelectFileOptions,
  TrainerStatusChangeEvent,
  GameStatusInfo,
  LibraryIOResult
} from './types';

export const IPC_CHANNELS = {
  // Games CRUD & status
  GAMES_LIST: 'games:list',
  GAMES_CREATE: 'games:create',
  GAMES_UPDATE: 'games:update',
  GAMES_DELETE: 'games:delete',
  GAMES_GET_STATUS: 'games:get-status',
  GAMES_REFRESH: 'games:refresh',

  // Trainer process operations
  TRAINER_LAUNCH: 'trainer:launch',
  TRAINER_STOP: 'trainer:stop',
  TRAINER_STATUS_CHANGED: 'trainer:status-changed',

  // Library import / export
  LIBRARY_EXPORT: 'library:export',
  LIBRARY_IMPORT: 'library:import',

  // Dialogs
  DIALOG_SELECT_FILE: 'dialog:select-file',

  // Window operations
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
} as const;

export interface ElectronAPI {
  // Games
  listGames: () => Promise<GameWithStatus[]>;
  createGame: (input: CreateGameInput) => Promise<GameWithStatus>;
  updateGame: (id: string, input: UpdateGameInput) => Promise<GameWithStatus>;
  deleteGame: (id: string) => Promise<boolean>;
  getGameStatus: (id: string) => Promise<GameStatusInfo>;
  refreshGames: () => Promise<GameWithStatus[]>;

  // Trainer process
  launchTrainer: (gameId: string) => Promise<TrainerLaunchResult>;
  stopTrainer: (gameId: string) => Promise<TrainerStopResult>;
  onTrainerStatusChange: (
    callback: (event: TrainerStatusChangeEvent) => void
  ) => () => void;

  // Native Dialogs
  selectFile: (options: SelectFileOptions) => Promise<string | null>;

  // Library import / export
  exportLibrary: () => Promise<LibraryIOResult>;
  importLibrary: () => Promise<LibraryIOResult>;

  // Window Controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
