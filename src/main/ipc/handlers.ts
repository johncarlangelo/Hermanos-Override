import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc';
import type {
  CreateGameInput,
  UpdateGameInput,
  SelectFileOptions,
  AppSettings
} from '../../shared/types';
import { GameManager } from '../services/gameManager';
import { TrainerManager } from '../services/trainerManager';
import { StorageService } from '../services/storageService';
import { DialogService } from '../services/dialogService';

export function registerIpcHandlers(
  gameManager: GameManager,
  trainerManager: TrainerManager,
  storageService: StorageService,
  getMainWindow: () => BrowserWindow | null
): void {
  // Basic payload guards so malformed renderer input can never reach the
  // service layer with unexpected shapes.
  const isNonEmptyString = (v: unknown): v is string =>
    typeof v === 'string' && v.trim().length > 0;
  const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

  // Games
  ipcMain.handle(IPC_CHANNELS.GAMES_LIST, async () => {
    return gameManager.listGames();
  });

  ipcMain.handle(IPC_CHANNELS.GAMES_CREATE, async (_event, input: CreateGameInput) => {
    if (!isPlainObject(input)) throw new Error('Invalid create payload');
    return gameManager.createGame(input as CreateGameInput);
  });

  ipcMain.handle(
    IPC_CHANNELS.GAMES_UPDATE,
    async (_event, id: string, input: UpdateGameInput) => {
      if (!isNonEmptyString(id) || !isPlainObject(input)) {
        throw new Error('Invalid update payload');
      }
      return gameManager.updateGame(id, input as UpdateGameInput);
    }
  );

  ipcMain.handle(IPC_CHANNELS.GAMES_DELETE, async (_event, id: string) => {
    if (!isNonEmptyString(id)) return false;
    return gameManager.deleteGame(id);
  });

  ipcMain.handle(IPC_CHANNELS.GAMES_GET_STATUS, async (_event, id: string) => {
    if (!isNonEmptyString(id)) {
      throw new Error('A valid game id is required');
    }
    return gameManager.getGameStatus(id);
  });

  ipcMain.handle(IPC_CHANNELS.GAMES_REFRESH, async () => {
    return gameManager.listGames();
  });

  // Trainer
  ipcMain.handle(IPC_CHANNELS.TRAINER_LAUNCH, async (_event, gameId: string) => {
    if (!isNonEmptyString(gameId)) {
      return { success: false, error: 'A valid game id is required' };
    }
    const game = await gameManager.getGameById(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }
    if (!game.trainerExePath) {
      return { success: false, error: 'No trainer path configured for this game' };
    }
    return trainerManager.launchTrainer(gameId, game.trainerExePath);
  });

  ipcMain.handle(IPC_CHANNELS.TRAINER_STOP, async (_event, gameId: string) => {
    if (!isNonEmptyString(gameId)) {
      return { success: false, error: 'A valid game id is required' };
    }
    return trainerManager.stopTrainer(gameId);
  });

  // Wire up trainer manager status changes to send to renderer
  trainerManager.onStatusChange((event) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.TRAINER_STATUS_CHANGED, event);
    }
  });

  // Dialogs
  ipcMain.handle(
    IPC_CHANNELS.DIALOG_SELECT_FILE,
    async (_event, options: SelectFileOptions) => {
      if (options !== undefined && !isPlainObject(options)) {
        throw new Error('Invalid dialog options');
      }
      const win = getMainWindow();
      return DialogService.selectFile(win, options);
    }
  );

  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    return storageService.loadSettings();
  });

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_UPDATE,
    async (_event, newSettings: Partial<AppSettings>) => {
      if (!isPlainObject(newSettings)) throw new Error('Invalid settings payload');
      const current = await storageService.loadSettings();
      const updated: AppSettings = {
        ...current,
        ...newSettings
      };
      await storageService.saveSettings(updated);
      return updated;
    }
  );

  // Window Controls
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.minimize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.close();
    }
  });

  ipcMain.on(
    IPC_CHANNELS.WINDOW_SET_TITLEBAR_THEME,
    (_event, theme: 'dark' | 'light') => {
      const win = getMainWindow();
      if (win && !win.isDestroyed() && process.platform === 'win32') {
        try {
          if (theme === 'dark') {
            win.setTitleBarOverlay({
              color: '#090d16',
              symbolColor: '#94a3b8',
              height: 36
            });
          } else {
            win.setTitleBarOverlay({
              color: '#ffffff',
              symbolColor: '#475569',
              height: 36
            });
          }
        } catch {
          // ignore if not supported
        }
      }
    }
  );
}
