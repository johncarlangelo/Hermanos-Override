import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_CHANNELS, ElectronAPI } from '../shared/ipc';
import type {
  CreateGameInput,
  UpdateGameInput,
  SelectFileOptions,
  AppSettings,
  TrainerStatusChangeEvent
} from '../shared/types';

const api: ElectronAPI = {
  listGames: () => ipcRenderer.invoke(IPC_CHANNELS.GAMES_LIST),
  createGame: (input: CreateGameInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.GAMES_CREATE, input),
  updateGame: (id: string, input: UpdateGameInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.GAMES_UPDATE, id, input),
  deleteGame: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GAMES_DELETE, id),
  getGameStatus: (id: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GAMES_GET_STATUS, id),
  refreshGames: () => ipcRenderer.invoke(IPC_CHANNELS.GAMES_REFRESH),

  launchTrainer: (gameId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAINER_LAUNCH, gameId),
  stopTrainer: (gameId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAINER_STOP, gameId),

  onTrainerStatusChange: (callback: (event: TrainerStatusChangeEvent) => void) => {
    const handler = (_e: IpcRendererEvent, event: TrainerStatusChangeEvent) => {
      callback(event);
    };
    ipcRenderer.on(IPC_CHANNELS.TRAINER_STATUS_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TRAINER_STATUS_CHANGED, handler);
    };
  },

  selectFile: (options: SelectFileOptions) =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_FILE, options),

  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  updateSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, settings),

  minimizeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  setTitleBarTheme: (theme: 'dark' | 'light') =>
    ipcRenderer.send(IPC_CHANNELS.WINDOW_SET_TITLEBAR_THEME, theme)
};

contextBridge.exposeInMainWorld('electronAPI', api);
