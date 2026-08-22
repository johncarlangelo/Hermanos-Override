import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/renderer/App';
import { StorageService } from '../src/main/services/storageService';
import { TrainerManager } from '../src/main/services/trainerManager';
import { GameManager } from '../src/main/services/gameManager';
import type { GameWithStatus, TrainerStatusChangeEvent } from '../src/shared/types';
import type { ElectronAPI } from '../src/shared/ipc';

describe('Comprehensive Gate Verifications (Gate 1 to Gate 16)', () => {
  let tempDir: string;
  let storage: StorageService;
  let trainerManager: TrainerManager;
  let gameManager: GameManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermanos-gates-test-'));
    storage = new StorageService({ dataDir: tempDir });
    trainerManager = new TrainerManager();
    gameManager = new GameManager(storage, trainerManager);
  });

  afterEach(() => {
    trainerManager.stopAll();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Gate 2: Startup & Security Isolation Checks
  describe('Gate 2: Startup configuration and bundle files', () => {
    it('verifies that distribution bundle files exist and main entry is correctly configured', () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
      expect(packageJson.main).toBe('dist-electron/main.js');

      expect(fs.existsSync(path.join(process.cwd(), 'dist/index.html'))).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), 'dist-electron/main.js'))).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), 'dist-electron/preload.js'))).toBe(true);
    });
  });

  // Gate 3: Empty state
  describe('Gate 3: Empty state', () => {
    it('shows intended empty state without fake/mock game records', async () => {
      const emptyGames = await gameManager.listGames();
      expect(emptyGames).toHaveLength(0);

      const mockApi: Partial<ElectronAPI> = {
        listGames: vi.fn().mockResolvedValue([]),
        onTrainerStatusChange: vi.fn().mockReturnValue(() => {}),
        minimizeWindow: vi.fn(),
        maximizeWindow: vi.fn(),
        closeWindow: vi.fn()
      };
      window.electronAPI = mockApi as ElectronAPI;

      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('No games in your library yet')).toBeInTheDocument();
        expect(screen.getByText('Add Your First Game')).toBeInTheDocument();
      });
    });
  });

  // Gate 4: Add game
  describe('Gate 4: Add game validation and creation', () => {
    it('requires game name and game executable path, accepts optional trainer executable', async () => {
      // Empty name
      await expect(
        gameManager.createGame({ name: '', gameExePath: 'C:\\game.exe' })
      ).rejects.toThrow('Game name is required');

      // Whitespace name
      await expect(
        gameManager.createGame({ name: '   ', gameExePath: 'C:\\game.exe' })
      ).rejects.toThrow('Game name is required');

      // Empty executable
      await expect(
        gameManager.createGame({ name: 'Valid Game', gameExePath: '' })
      ).rejects.toThrow('Game executable path is required');

      // Valid without trainer
      const gameExe = path.join(tempDir, 'game.exe');
      fs.writeFileSync(gameExe, 'exe content');

      const created = await gameManager.createGame({
        name: 'Hades',
        gameExePath: gameExe
      });
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Hades');
      expect(created.gameExePath).toBe(gameExe);
      expect(created.trainerExePath).toBeUndefined();
      expect(created.status).toBe('no_trainer');

      // Saved game appears in library
      const list = await gameManager.listGames();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(created.id);
    });
  });

  // Gate 5: Edit game
  describe('Gate 5: Edit game updates existing record and survives restart', () => {
    it('updates record fields without duplicating and persists across service reload', async () => {
      const gameExe1 = path.join(tempDir, 'game1.exe');
      const gameExe2 = path.join(tempDir, 'game2.exe');
      const trainerExe = path.join(tempDir, 'trainer.exe');
      fs.writeFileSync(gameExe1, 'exe1');
      fs.writeFileSync(gameExe2, 'exe2');
      fs.writeFileSync(trainerExe, 'trainer');

      const created = await gameManager.createGame({
        name: 'Original Name',
        gameExePath: gameExe1
      });

      const updated = await gameManager.updateGame(created.id, {
        name: 'Updated Name',
        gameExePath: gameExe2,
        trainerExePath: trainerExe
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated Name');
      expect(updated.gameExePath).toBe(gameExe2);
      expect(updated.trainerExePath).toBe(trainerExe);
      expect(updated.status).toBe('ready');

      // Simulate app restart with new GameManager/StorageService instances on same directory
      const restartedStorage = new StorageService({ dataDir: tempDir });
      const restartedGameManager = new GameManager(restartedStorage, new TrainerManager());
      const persistedList = await restartedGameManager.listGames();

      expect(persistedList).toHaveLength(1);
      expect(persistedList[0].id).toBe(created.id);
      expect(persistedList[0].name).toBe('Updated Name');
      expect(persistedList[0].gameExePath).toBe(gameExe2);
      expect(persistedList[0].trainerExePath).toBe(trainerExe);
      expect(persistedList[0].status).toBe('ready');
    });
  });

  // Gate 6: Delete safety
  describe('Gate 6: Delete safety guarantee', () => {
    it('removes the game entry from store while preserving all user files intact on disk', async () => {
      const gameExe = path.join(tempDir, 'actual_game.exe');
      const trainerExe = path.join(tempDir, 'actual_trainer.exe');
      fs.writeFileSync(gameExe, 'unmodified game content');
      fs.writeFileSync(trainerExe, 'unmodified trainer content');

      const created = await gameManager.createGame({
        name: 'Protected Game',
        gameExePath: gameExe,
        trainerExePath: trainerExe
      });

      expect(fs.existsSync(gameExe)).toBe(true);
      expect(fs.existsSync(trainerExe)).toBe(true);

      const deleteSuccess = await gameManager.deleteGame(created.id);
      expect(deleteSuccess).toBe(true);

      const listAfterDelete = await gameManager.listGames();
      expect(listAfterDelete.find((g) => g.id === created.id)).toBeUndefined();

      // Files MUST remain untouched
      expect(fs.existsSync(gameExe)).toBe(true);
      expect(fs.existsSync(trainerExe)).toBe(true);
      expect(fs.readFileSync(gameExe, 'utf-8')).toBe('unmodified game content');
      expect(fs.readFileSync(trainerExe, 'utf-8')).toBe('unmodified trainer content');
    });
  });

  // Gate 7: Dynamic status
  describe('Gate 7: Dynamic status calculation for all 5 states', () => {
    it('evaluates status dynamically based on current filesystem and process state', async () => {
      const gameExe = path.join(tempDir, 'game_dyn.exe');
      const trainerExe = path.join(tempDir, 'trainer_dyn.exe');
      const missingGameExe = path.join(tempDir, 'missing_game.exe');
      const missingTrainerExe = path.join(tempDir, 'missing_trainer.exe');

      fs.writeFileSync(gameExe, 'game');
      fs.writeFileSync(trainerExe, 'trainer');

      // 1. missing_game
      const g1 = await gameManager.createGame({ name: 'State 1', gameExePath: missingGameExe });
      expect(g1.status).toBe('missing_game');

      // 2. no_trainer
      const g2 = await gameManager.createGame({ name: 'State 2', gameExePath: gameExe });
      expect(g2.status).toBe('no_trainer');

      // 3. missing_trainer
      const g3 = await gameManager.createGame({ name: 'State 3', gameExePath: gameExe, trainerExePath: missingTrainerExe });
      expect(g3.status).toBe('missing_trainer');

      // 4. ready
      const g4 = await gameManager.createGame({ name: 'State 4', gameExePath: gameExe, trainerExePath: trainerExe });
      expect(g4.status).toBe('ready');

      // 5. trainer_running
      const testExe = process.platform === 'win32' ? 'C:\\Windows\\System32\\cmd.exe' : '/bin/sh';
      const g5 = await gameManager.createGame({ name: 'State 5', gameExePath: gameExe, trainerExePath: testExe });
      const launchResult = await trainerManager.launchTrainer(g5.id, testExe);
      expect(launchResult.success).toBe(true);

      const runningStatus = await gameManager.getGameStatus(g5.id);
      expect(runningStatus.status).toBe('trainer_running');
      expect(runningStatus.trainerRunning).toBe(true);

      await trainerManager.stopTrainer(g5.id);
    });

    it('confirms stored JSON never persists stale status field', async () => {
      const gameExe = path.join(tempDir, 'status_strip.exe');
      fs.writeFileSync(gameExe, 'binary');
      await gameManager.createGame({ name: 'No Persist Status', gameExePath: gameExe });

      const rawJson = fs.readFileSync(storage.getGamesFilePath(), 'utf-8');
      const parsed = JSON.parse(rawJson);
      expect(parsed[0].status).toBeUndefined();
      expect(parsed[0].trainerPid).toBeUndefined();
    });
  });

  // Gate 8: Trainer launch & process management
  describe('Gate 8: Trainer launch & process management', () => {
    it('prevents launch when files are missing and launches valid process', async () => {
      const resultMissing = await trainerManager.launchTrainer('invalid-id', path.join(tempDir, 'nonexistent.exe'));
      expect(resultMissing.success).toBe(false);
      expect(resultMissing.error).toBeDefined();

      const testExe = process.platform === 'win32' ? 'C:\\Windows\\System32\\cmd.exe' : '/bin/sh';
      const launchResult = await trainerManager.launchTrainer('game-launch', testExe);
      expect(launchResult.success).toBe(true);
      expect(launchResult.pid).toBeDefined();
      expect(trainerManager.isTrainerRunning('game-launch')).toBe(true);

      // Duplicate launch handling
      const duplicateResult = await trainerManager.launchTrainer('game-launch', testExe);
      expect(duplicateResult.success).toBe(true);
      expect(duplicateResult.pid).toBe(launchResult.pid);

      await trainerManager.stopTrainer('game-launch');
    });
  });

  // Gate 9: Trainer stop
  describe('Gate 9: Trainer stop', () => {
    it('stops tracked process and returns to ready state', async () => {
      const testExe = process.platform === 'win32' ? 'C:\\Windows\\System32\\cmd.exe' : '/bin/sh';
      await trainerManager.launchTrainer('game-stop-test', testExe);
      expect(trainerManager.isTrainerRunning('game-stop-test')).toBe(true);

      const stopResult = await trainerManager.stopTrainer('game-stop-test');
      expect(stopResult.success).toBe(true);
      expect(trainerManager.isTrainerRunning('game-stop-test')).toBe(false);
    });
  });

  // Gate 10: Unexpected exit handling
  describe('Gate 10: Unexpected process exit handling', () => {
    it('detects process exit and notifies listeners with unexpectedExit flag', async () => {
      const isWindows = process.platform === 'win32';
      // Use short-lived command that exits on its own
      const testExe = isWindows ? 'C:\\Windows\\System32\\cmd.exe' : '/bin/sh';

      const events: TrainerStatusChangeEvent[] = [];
      trainerManager.onStatusChange((event) => {
        events.push(event);
      });

      const launch = await trainerManager.launchTrainer('game-exit-test', testExe);
      expect(launch.success).toBe(true);

      // Wait a brief moment for cmd.exe to exit naturally when spawned with ignore stdio
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if exit was recorded
      expect(events.some((e) => e.gameId === 'game-exit-test' && e.trainerRunning === false)).toBe(true);
      expect(trainerManager.isTrainerRunning('game-exit-test')).toBe(false);
    });
  });

  // Gate 11: Persistence in OS application-data directory
  describe('Gate 11: Persistence in OS application-data directory', () => {
    it('uses OS application-data directory path structure and retains data across reloads', async () => {
      const defaultStorage = new StorageService();
      const expectedAppData = process.env.APPDATA || (process.platform === 'darwin' ? 'Library/Application Support' : '.config');
      expect(defaultStorage.getDataDir()).toContain(expectedAppData);
      expect(defaultStorage.getDataDir()).toContain('Hermanos Override');

      // Test data reload with custom test dir
      const gameExe = path.join(tempDir, 'persist_test.exe');
      fs.writeFileSync(gameExe, 'exe');

      const saved = await gameManager.createGame({
        name: 'Persistence Check',
        gameExePath: gameExe
      });

      // Reload
      const reloadedStorage = new StorageService({ dataDir: tempDir });
      const games = await reloadedStorage.loadGames();
      expect(games.some((g) => g.id === saved.id && g.name === 'Persistence Check')).toBe(true);
    });
  });

  // Gate 12: Missing trainer recovery
  describe('Gate 12: Missing trainer recovery workflow', () => {
    it('transitions Ready -> Missing Trainer -> Relink -> Ready', async () => {
      const gameExe = path.join(tempDir, 'game_m_tr.exe');
      const trainerExe1 = path.join(tempDir, 'trainer_m_tr_1.exe');
      const trainerExe2 = path.join(tempDir, 'trainer_m_tr_2.exe');

      fs.writeFileSync(gameExe, 'game');
      fs.writeFileSync(trainerExe1, 'trainer 1');
      fs.writeFileSync(trainerExe2, 'trainer 2');

      // 1 & 2: Configure valid trainer -> Ready
      const game = await gameManager.createGame({
        name: 'Trainer Recovery Game',
        gameExePath: gameExe,
        trainerExePath: trainerExe1
      });
      expect(game.status).toBe('ready');

      // 3 & 4: Move/delete trainer outside application -> Missing Trainer
      fs.unlinkSync(trainerExe1);
      const statusAfterDelete = await gameManager.getGameStatus(game.id);
      expect(statusAfterDelete.status).toBe('missing_trainer');

      // 5 & 6: Relink the trainer
      const updated = await gameManager.updateGame(game.id, {
        trainerExePath: trainerExe2
      });

      // 7: Confirm Ready
      expect(updated.status).toBe('ready');
    });
  });

  // Gate 13: Missing game recovery
  describe('Gate 13: Missing game recovery workflow', () => {
    it('transitions Ready -> Missing Game -> Relink -> Ready', async () => {
      const gameExe1 = path.join(tempDir, 'game_m_gm_1.exe');
      const gameExe2 = path.join(tempDir, 'game_m_gm_2.exe');
      const trainerExe = path.join(tempDir, 'trainer_m_gm.exe');

      fs.writeFileSync(gameExe1, 'game 1');
      fs.writeFileSync(gameExe2, 'game 2');
      fs.writeFileSync(trainerExe, 'trainer');

      // 1 & 2: Configure valid game executable -> Ready
      const game = await gameManager.createGame({
        name: 'Game Recovery Test',
        gameExePath: gameExe1,
        trainerExePath: trainerExe
      });
      expect(game.status).toBe('ready');

      // 3 & 4: Move/delete game executable outside application -> Missing Game
      fs.unlinkSync(gameExe1);
      const statusAfterDelete = await gameManager.getGameStatus(game.id);
      expect(statusAfterDelete.status).toBe('missing_game');

      // 5 & 6: Relink game executable
      const updated = await gameManager.updateGame(game.id, {
        gameExePath: gameExe2
      });

      // 7: Confirm recovered Ready state
      expect(updated.status).toBe('ready');
    });
  });

  // Gate 14: Search
  describe('Gate 14: Search filtering and behavior', () => {
    it('filters case-insensitively, restores on clear, and does not mutate store', async () => {
      const mockGames: GameWithStatus[] = [
        {
          id: '1',
          name: 'Cyberpunk 2077',
          gameExePath: 'C:\\Games\\cp2077.exe',
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Monster Hunter: Wilds',
          gameExePath: 'C:\\Games\\mhwilds.exe',
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const mockApi: Partial<ElectronAPI> = {
        listGames: vi.fn().mockResolvedValue(mockGames),
        onTrainerStatusChange: vi.fn().mockReturnValue(() => {}),
        minimizeWindow: vi.fn(),
        maximizeWindow: vi.fn(),
        closeWindow: vi.fn()
      };
      window.electronAPI = mockApi as ElectronAPI;

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
        expect(screen.getByText('Monster Hunter: Wilds')).toBeInTheDocument();
      });

      // Filter with lower case
      const searchInput = screen.getByPlaceholderText('Search library...');
      fireEvent.change(searchInput, { target: { value: 'cyber' } });

      await waitFor(() => {
        expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
        expect(screen.queryByText('Monster Hunter: Wilds')).not.toBeInTheDocument();
      });

      // Clear search
      const clearBtn = screen.getByLabelText('Clear search');
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
        expect(screen.getByText('Monster Hunter: Wilds')).toBeInTheDocument();
      });

      // Empty query match feedback
      fireEvent.change(searchInput, { target: { value: 'NonexistentTitle123' } });
      await waitFor(() => {
        expect(screen.getByText('No games matching "NonexistentTitle123"')).toBeInTheDocument();
      });
    });
  });

  // Gate 15: UI / UX Accessibility & Dark-Only Theme
  describe('Gate 15: UI / UX Dark-Only Theme', () => {
    it('renders without any theme-switching controls (dark mode is locked)', async () => {
      const mockApi: Partial<ElectronAPI> = {
        listGames: vi.fn().mockResolvedValue([]),
        onTrainerStatusChange: vi.fn().mockReturnValue(() => {}),
        minimizeWindow: vi.fn(),
        maximizeWindow: vi.fn(),
        closeWindow: vi.fn()
      };
      window.electronAPI = mockApi as ElectronAPI;

      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText('Hermanos Override').length).toBeGreaterThan(0);
      });

      // The legacy light/dark/system toggle must be gone
      expect(screen.queryByLabelText(/Current theme/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/theme/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/light mode|light theme/i)).not.toBeInTheDocument();
    });
  });

  // Gate 16: Out-of-scope feature audit
  describe('Gate 16: Out-of-scope feature audit', () => {
    it('confirms no unauthorized networking or out-of-scope APIs exist in codebase', () => {
      const srcDir = path.join(process.cwd(), 'src');
      
      const checkDirectory = (dir: string): string[] => {
        let files: string[] = [];
        for (const item of fs.readdirSync(dir)) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(checkDirectory(fullPath));
          } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            files.push(fullPath);
          }
        }
        return files;
      };

      const sourceFiles = checkDirectory(srcDir);
      const bannedTerms = [
        'downloadTrainer',
        'CheatEngine',
        'memoryScan',
        'hotkeyHook',
        'cloudSync',
        'authService',
        'userAccount',
        'remoteApi'
      ];

      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const term of bannedTerms) {
          expect(content.includes(term), `Banned term "${term}" found in ${file}`).toBe(false);
        }
      }
    });
  });
});
