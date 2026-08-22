import fs from 'fs';
import path from 'path';
import type { Game, AppSettings } from '../../shared/types';

export interface StorageOptions {
  dataDir?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system'
};

export class StorageService {
  private dataDir: string;
  private gamesFilePath: string;
  private settingsFilePath: string;

  constructor(options?: StorageOptions) {
    if (options?.dataDir) {
      this.dataDir = options.dataDir;
    } else {
      // In Electron runtime, we resolve from app.getPath('userData')
      // Fallback to process.env.APPDATA or standard path
      const appData =
        process.env.APPDATA ||
        (process.platform === 'darwin'
          ? path.join(process.env.HOME || '', 'Library', 'Application Support')
          : path.join(process.env.HOME || '', '.config'));
      this.dataDir = path.join(appData, 'Hermanos Override', 'data');
    }

    this.gamesFilePath = path.join(this.dataDir, 'games.json');
    this.settingsFilePath = path.join(this.dataDir, 'settings.json');
  }

  public getDataDir(): string {
    return this.dataDir;
  }

  public getGamesFilePath(): string {
    return this.gamesFilePath;
  }

  public getSettingsFilePath(): string {
    return this.settingsFilePath;
  }

  private ensureDirSync(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private async atomicWriteFile(filePath: string, data: string): Promise<void> {
    this.ensureDirSync();
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
    try {
      await fs.promises.writeFile(tempPath, data, 'utf-8');
      await fs.promises.rename(tempPath, filePath);
    } catch (err) {
      if (fs.existsSync(tempPath)) {
        try {
          await fs.promises.unlink(tempPath);
        } catch {
          // ignore
        }
      }
      throw err;
    }
  }

  private sanitizeGameRecord(item: any): Game | null {    if (!item || typeof item !== 'object') return null;
    if (typeof item.id !== 'string' || !item.id.trim()) return null;
    if (typeof item.name !== 'string' || !item.name.trim()) return null;
    if (typeof item.gameExePath !== 'string' || !item.gameExePath.trim()) return null;

    return {
      id: item.id,
      name: item.name,
      gameExePath: item.gameExePath,
      trainerExePath: typeof item.trainerExePath === 'string' && item.trainerExePath.trim() ? item.trainerExePath : undefined,
      iconPath: typeof item.iconPath === 'string' && item.iconPath.trim() ? item.iconPath : undefined,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString()
    };
  }

  private backupCorruptFile(filePath: string): void {
    try {
      const backupPath = `${filePath}.corrupt-${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      console.warn(`Backed up corrupt data file to: ${backupPath}`);
    } catch (backupErr) {
      console.error('Failed to back up corrupt data file:', backupErr);
    }
  }

  /**
   * Validates an untrusted array (e.g. from an imported JSON file) and
   * returns only well-formed game records.
   */
  public sanitizeGames(raw: unknown): Game[] {
    if (!Array.isArray(raw)) return [];
    const games: Game[] = [];
    for (const item of raw) {
      const sanitized = this.sanitizeGameRecord(item);
      if (sanitized) games.push(sanitized);
    }
    return games;
  }

  public async loadGames(): Promise<Game[]> {
    try {
      this.ensureDirSync();
      if (!fs.existsSync(this.gamesFilePath)) {
        return [];
      }
      const raw = await fs.promises.readFile(this.gamesFilePath, 'utf-8');
      if (!raw.trim()) {
        return [];
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        // Preserve the corrupt file for manual recovery instead of silently
        // losing the user's library on the next save.
        console.error('games.json is corrupt:', parseErr);
        this.backupCorruptFile(this.gamesFilePath);
        return [];
      }
      if (!Array.isArray(parsed)) {
        console.error('games.json does not contain an array; backing up.');
        this.backupCorruptFile(this.gamesFilePath);
        return [];
      }
      // Sanitize each record to avoid persisted derived status and drop
      // malformed entries rather than crashing or persisting garbage.
      const games: Game[] = [];
      for (const item of parsed) {
        const sanitized = this.sanitizeGameRecord(item);
        if (sanitized) games.push(sanitized);
      }
      return games;
    } catch (err) {
      console.error('Failed to read games.json:', err);
      return [];
    }
  }

  public async saveGames(games: Game[]): Promise<void> {
    // Strip any accidental derived status before saving
    const sanitized = games.map((game) => ({
      id: game.id,
      name: game.name,
      gameExePath: game.gameExePath,
      trainerExePath: game.trainerExePath || undefined,
      iconPath: game.iconPath || undefined,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
    }));

    const json = JSON.stringify(sanitized, null, 2);
    await this.atomicWriteFile(this.gamesFilePath, json);
  }

  public async loadSettings(): Promise<AppSettings> {
    try {
      this.ensureDirSync();
      if (!fs.existsSync(this.settingsFilePath)) {
        return { ...DEFAULT_SETTINGS };
      }
      const raw = await fs.promises.readFile(this.settingsFilePath, 'utf-8');
      if (!raw.trim()) {
        return { ...DEFAULT_SETTINGS };
      }
      const parsed = JSON.parse(raw);
      return {
        theme: ['dark', 'light', 'system'].includes(parsed.theme) ? parsed.theme : 'system'
      };
    } catch (err) {
      console.error('Failed to read settings.json:', err);
      return { ...DEFAULT_SETTINGS };
    }
  }

  public async saveSettings(settings: AppSettings): Promise<void> {
    const json = JSON.stringify(settings, null, 2);
    await this.atomicWriteFile(this.settingsFilePath, json);
  }
}
