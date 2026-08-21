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
  // Games
  ipcMain.handle(IPC_CHANNELS.GAMES_LIST, async () => {
    return gameManager.listGames();
  });

  ipcMain.handle(IPC_CHANNELS.GAMES_CREATE, async (_event, input: CreateGameInput) => {
    return gameManager.createGame(input);
  });

  ipcMain.handle(
    IPC_CHANNELS.GAMES_UPDATE,
    async (_event, id: string, input: UpdateGameInput) => {
      return gameManager.updateGame(id, input);
    }
  );

  ipcMain.handle(IPC_CHANNELS.GAMES_DELETE, async (_event, id: string) => {
    return gameManager.deleteGame(id);
  });

  ipcMain.handle(IPC_CHANNELS.GAMES_GET_STATUS, async (_event, id: string) => {
    return gameManager.getGameStatus(id);
  });

  ipcMain.handle(IPC_CHANNELS.GAMES_REFRESH, async () => {
    return gameManager.listGames();
  });

  // Trainer
  ipcMain.handle(IPC_CHANNELS.TRAINER_LAUNCH, async (_event, gameId: string) => {
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
