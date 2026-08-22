import { app, BrowserWindow, dialog, protocol, net, screen } from 'electron';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { StorageService } from './services/storageService';
import { TrainerManager } from './services/trainerManager';
import { GameManager } from './services/gameManager';
import { registerIpcHandlers } from './ipc/handlers';
import type { WindowState } from '../shared/types';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const ALLOWED_ASSET_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.ico',
  '.gif',
  '.webp'
]);

function isAllowedAssetPath(rawPath: string): boolean {
  try {
    if (!path.isAbsolute(rawPath)) return false;
    const resolved = path.resolve(rawPath);
    const ext = path.extname(resolved).toLowerCase();
    return ALLOWED_ASSET_EXTENSIONS.has(ext) && fs.existsSync(resolved);
  } catch {
    return false;
  }
}

const storageService = new StorageService();
const trainerManager = new TrainerManager();
const gameManager = new GameManager(storageService, trainerManager);

const MIN_WINDOW_WIDTH = 840;
const MIN_WINDOW_HEIGHT = 580;
const DEFAULT_WIDTH = 1180;
const DEFAULT_HEIGHT = 780;

function computeInitialBounds(saved: WindowState | null): {
  width: number;
  height: number;
  x?: number;
  y?: number;
} {
  let width = saved?.width ?? DEFAULT_WIDTH;
  let height = saved?.height ?? DEFAULT_HEIGHT;

  // Clamp size to sane physical limits
  width = Math.min(Math.max(Math.round(width), MIN_WINDOW_WIDTH), 7680);
  height = Math.min(Math.max(Math.round(height), MIN_WINDOW_HEIGHT), 4320);

  const result: { width: number; height: number; x?: number; y?: number } = {
    width,
    height
  };

  // Only restore position when it lands on a currently attached display,
  // clamped so the window is fully visible (e.g. after monitor unplug).
  if (
    saved?.x !== undefined &&
    saved?.y !== undefined &&
    Number.isFinite(saved.x) &&
    Number.isFinite(saved.y)
  ) {
    try {
      const display = screen.getDisplayMatching({
        x: Math.round(saved.x),
        y: Math.round(saved.y),
        width,
        height
      });
      const wa = display.workArea;
      const x = Math.min(
        Math.max(Math.round(saved.x), wa.x),
        wa.x + wa.width - MIN_WINDOW_WIDTH
      );
      const y = Math.min(
        Math.max(Math.round(saved.y), wa.y),
        wa.y + wa.height - MIN_WINDOW_HEIGHT
      );
      result.x = x;
      result.y = y;
    } catch {
      // No displays available yet; fall back to OS-centered placement.
    }
  }

  return result;
}

function createWindow(savedWindowState: WindowState | null): void {
  let forceClose = false;
  const bounds = computeInitialBounds(savedWindowState);

  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: 'Hermanos Override',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#090d16',
      symbolColor: '#94a3b8',
      height: 36
    },
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true
    },
    show: false
  });

  if (savedWindowState?.isMaximized) {
    mainWindow.maximize();
  }

  // Persist window geometry so size/position survive restarts
  const persistWindowState = (): void => {
    const win = mainWindow;
    if (!win || win.isDestroyed()) return;
    try {
      storageService.saveWindowStateSync({
        ...win.getNormalBounds(),
        isMaximized: win.isMaximized()
      });
    } catch (err) {
      console.error('Failed to persist window state:', err);
    }
  };
  let persistTimer: NodeJS.Timeout | null = null;
  const debouncedPersist = (): void => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(persistWindowState, 500);
  };
  mainWindow.on('resize', debouncedPersist);
  mainWindow.on('move', debouncedPersist);
  mainWindow.on('maximize', persistWindowState);
  mainWindow.on('unmaximize', persistWindowState);
  mainWindow.on('close', () => {
    if (persistTimer) clearTimeout(persistTimer);
    persistWindowState();
  });

  // Security: Deny new window/popups and unapproved in-app navigations
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (mainWindow && url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
    }
  });

  // Guard: warn before closing while trainer processes are still active,
  // since closing the app terminates them.
  mainWindow.on('close', async (event) => {
    if (forceClose) return;
    const win = mainWindow;
    if (!win || win.isDestroyed()) return;

    const runningCount = trainerManager.getRunningCount();
    if (runningCount === 0) return;

    event.preventDefault();
    const { response } = await dialog.showMessageBox(win, {
      type: 'warning',
      buttons: ['Stop trainers & exit', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      title: 'Trainers still running',
      message:
        runningCount === 1
          ? '1 trainer is still running.'
          : `${runningCount} trainers are still running.`,
      detail: 'Closing Hermanos Override will stop all active trainer processes.'
    });

    if (response === 0) {
      forceClose = true;
      await trainerManager.stopAll();
      if (!win.isDestroyed()) {
        win.close();
      }
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // Another instance is already running; focus it instead and exit.
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady()
    .then(() => storageService.loadWindowState())
    .then((savedWindowState) => {
  // Register custom protocol for local image assets under webSecurity.
  // Security: only absolute paths to existing whitelisted image files are served,
  // so a compromised renderer cannot exfiltrate arbitrary files from disk.
  protocol.handle('app-asset', (request) => {
    const rawPath = decodeURIComponent(request.url.replace(/^app-asset:\/\//, ''));
    if (!isAllowedAssetPath(rawPath)) {
      return new Response('Not Found', { status: 404 });
    }
    try {
      return net.fetch(pathToFileURL(rawPath).toString());
    } catch (err) {
      console.error('Failed to load local asset via app-asset:', err);
      return new Response('Not Found', { status: 404 });
    }
  });

  registerIpcHandlers(
    gameManager,
    trainerManager,
    storageService,
    () => mainWindow
  );

  createWindow(savedWindowState);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(storageService.loadWindowStateSync());
    }
  });
  });
}

app.on('window-all-closed', () => {
  trainerManager.stopAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  trainerManager.stopAll();
});
