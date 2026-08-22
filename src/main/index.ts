import { app, BrowserWindow, dialog, protocol, net } from 'electron';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { StorageService } from './services/storageService';
import { TrainerManager } from './services/trainerManager';
import { GameManager } from './services/gameManager';
import { registerIpcHandlers } from './ipc/handlers';

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

function createWindow(): void {
  let forceClose = false;

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 840,
    minHeight: 580,
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

  app.whenReady().then(() => {
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

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
