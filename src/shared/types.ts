/**
 * Core game record persisted to local storage (JSON).
 * Note: Status is derived dynamically and must NEVER be stored here.
 */
export interface Game {
  id: string;
  name: string;
  gameExePath: string;
  trainerExePath?: string;
  iconPath?: string;
  createdAt: string;
  updatedAt: string;
}

export type GameStatus =
  | 'missing_game'
  | 'no_trainer'
  | 'missing_trainer'
  | 'ready'
  | 'trainer_running';

export interface GameStatusInfo {
  status: GameStatus;
  gameExeExists: boolean;
  trainerExeExists: boolean;
  trainerRunning: boolean;
  trainerPid?: number;
}

export interface GameWithStatus extends Game {
  status: GameStatus;
  trainerPid?: number;
}

export interface CreateGameInput {
  name: string;
  gameExePath: string;
  trainerExePath?: string;
  iconPath?: string;
}

export interface UpdateGameInput {
  name?: string;
  gameExePath?: string;
  trainerExePath?: string | null;
  iconPath?: string | null;
}

export interface TrainerLaunchResult {
  success: boolean;
  pid?: number;
  error?: string;
}

export interface TrainerStopResult {
  success: boolean;
  error?: string;
}

export interface SelectFileOptions {
  title?: string;
  filterName?: string;
  extensions?: string[];
  defaultPath?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
}

export interface TrainerStatusChangeEvent {
  gameId: string;
  status: GameStatus;
  trainerRunning: boolean;
  pid?: number;
  unexpectedExit?: boolean;
  error?: string;
}

/** A transient UI notification (toast). Never persisted. */
export interface AppNotification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type StatusFilter = 'all' | 'ready' | 'running' | 'missing';

export interface LibraryIOResult {
  success: boolean;
  count?: number;
  path?: string;
  canceled?: boolean;
  error?: string;
}

/** Persisted window geometry. Restored on launch when valid. */
export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}
