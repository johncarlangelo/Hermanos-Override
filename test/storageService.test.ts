import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { StorageService } from '../src/main/services/storageService';
import type { Game, AppSettings } from '../src/shared/types';

describe('StorageService', () => {
  let tempDir: string;
  let storage: StorageService;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermanos-storage-test-'));
    storage = new StorageService({ dataDir: tempDir });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('initializes with empty games list when file does not exist', async () => {
    const games = await storage.loadGames();
    expect(games).toEqual([]);
  });

  it('saves and loads games successfully', async () => {
    const mockGames: Game[] = [
      {
        id: 'game-1',
        name: 'Cyberpunk 2077',
        gameExePath: 'C:\\Games\\Cyberpunk.exe',
        trainerExePath: 'C:\\Trainers\\CyberpunkTrainer.exe',
        createdAt: '2026-08-21T00:00:00.000Z',
        updatedAt: '2026-08-21T00:00:00.000Z'
      }
    ];

    await storage.saveGames(mockGames);
    const loaded = await storage.loadGames();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('game-1');
    expect(loaded[0].name).toBe('Cyberpunk 2077');
    expect(loaded[0].gameExePath).toBe('C:\\Games\\Cyberpunk.exe');
    expect(loaded[0].trainerExePath).toBe('C:\\Trainers\\CyberpunkTrainer.exe');
  });

  it('strips any transient status before persisting games to disk', async () => {
    const mockGamesWithStatus: any[] = [
      {
        id: 'game-2',
        name: 'Elden Ring',
        gameExePath: 'C:\\Games\\eldenring.exe',
        status: 'ready', // transient
        trainerPid: 1234, // transient
        createdAt: '2026-08-21T00:00:00.000Z',
        updatedAt: '2026-08-21T00:00:00.000Z'
      }
    ];

    await storage.saveGames(mockGamesWithStatus);
    const rawFileContent = fs.readFileSync(storage.getGamesFilePath(), 'utf-8');
    const parsed = JSON.parse(rawFileContent);

    expect(parsed[0].status).toBeUndefined();
    expect(parsed[0].trainerPid).toBeUndefined();
  });

  it('loads default settings when file does not exist', async () => {
    const settings = await storage.loadSettings();
    expect(settings).toEqual({ theme: 'system' });
  });

  it('saves and updates settings', async () => {
    const updated: AppSettings = { theme: 'dark' };
    await storage.saveSettings(updated);

    const loaded = await storage.loadSettings();
    expect(loaded.theme).toBe('dark');
  });
});
