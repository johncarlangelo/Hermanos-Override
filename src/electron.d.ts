declare module 'electron' {
  export interface IpcRendererEvent {
    sender: any;
    ports: any[];
  }

  export interface IpcMainInvokeEvent {
    sender: any;
    frameId: number;
  }

  export interface IpcMainEvent {
    sender: any;
    frameId: number;
    reply(channel: string, ...args: any[]): void;
  }

  export interface NativeImage {
    toPNG(): Buffer;
    isEmpty(): boolean;
  }

  export namespace app {
    export function whenReady(): Promise<void>;
    export function quit(): void;
    export function getPath(name: string): string;
    export function on(event: string, listener: (...args: any[]) => void): void;
    export function requestSingleInstanceLock(): boolean;
    export function getFileIcon(filePath: string, options?: { size?: 'small' | 'normal' | 'large' }): Promise<NativeImage>;
    export const isPackaged: boolean;
  }

  export class BrowserWindow {
    constructor(options?: any);
    webContents: {
      send(channel: string, ...args: any[]): void;
      setWindowOpenHandler(handler: (details: any) => { action: 'deny' | 'allow' }): void;
      on(event: string, listener: (...args: any[]) => void): void;
      getURL(): string;
    };
    show(): void;
    close(): void;
    minimize(): void;
    maximize(): void;
    unmaximize(): void;
    isMaximized(): boolean;
    isMinimized(): boolean;
    restore(): void;
    focus(): void;
    getNormalBounds(): Rectangle;
    isDestroyed(): boolean;
    setTitleBarOverlay(options: any): void;
    loadURL(url: string): Promise<void>;
    loadFile(filePath: string): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    static getAllWindows(): BrowserWindow[];
  }

  export namespace protocol {
    export function handle(scheme: string, handler: (request: Request) => Promise<Response> | Response): void;
  }

  export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Display {
    id: number;
    bounds: Rectangle;
    workArea: Rectangle;
  }

  export namespace screen {
    export function getPrimaryDisplay(): Display;
    export function getAllDisplays(): Display[];
    export function getDisplayMatching(rect: Rectangle): Display;
  }

  export namespace net {
    export function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }

  export namespace dialog {
    export interface OpenDialogOptions {
      title?: string;
      defaultPath?: string;
      buttonLabel?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
      message?: string;
    }
    export interface OpenDialogReturnValue {
      canceled: boolean;
      filePaths: string[];
    }
    export function showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
    export function showOpenDialog(browserWindow: BrowserWindow, options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
    export interface SaveDialogOptions {
      title?: string;
      defaultPath?: string;
      buttonLabel?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      properties?: Array<'showOverwriteConfirmation' | 'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
      message?: string;
    }
    export interface SaveDialogReturnValue {
      canceled: boolean;
      filePath?: string;
    }
    export function showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
    export function showSaveDialog(browserWindow: BrowserWindow, options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
    export interface MessageBoxReturnValue {
      response: number;
      checkboxChecked: boolean;
    }
    export function showMessageBox(options: any): Promise<MessageBoxReturnValue>;
    export function showMessageBox(browserWindow: BrowserWindow, options: any): Promise<MessageBoxReturnValue>;
  }

  export namespace ipcMain {
    export function handle(channel: string, listener: (event: any, ...args: any[]) => any): void;
    export function on(channel: string, listener: (event: any, ...args: any[]) => void): void;
    export function removeAllListeners(channel: string): void;
  }

  export namespace ipcRenderer {
    export function invoke(channel: string, ...args: any[]): Promise<any>;
    export function send(channel: string, ...args: any[]): void;
    export function on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): () => void;
    export function removeListener(channel: string, listener: (...args: any[]) => void): void;
  }

  export namespace contextBridge {
    export function exposeInMainWorld(apiKey: string, api: any): void;
  }

  const defaultExport: string;
  export default defaultExport;
}
