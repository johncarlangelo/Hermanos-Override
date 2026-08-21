import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';
import { StorageService } from './services/storageService';
import { TrainerManager } from './services/trainerManager';
import { GameManager } from './services/gameManager';
import { registerIpcHandlers } from './ipc/handlers';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const storageService = new StorageService();
const trainerManager = new TrainerManager();
const gameManager = new GameManager(storageService, trainerManager);

function createWindow(): void {
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

app.whenReady().then(() => {
  // Register custom protocol for local asset loading under webSecurity
  protocol.handle('app-asset', (request) => {
    const rawPath = decodeURIComponent(request.url.replace(/^app-asset:\/\//, ''));
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

app.on('window-all-closed', () => {
  trainerManager.stopAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  trainerManager.stopAll();
});
