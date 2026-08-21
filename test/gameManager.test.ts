import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { StorageService } from '../src/main/services/storageService';
import { TrainerManager } from '../src/main/services/trainerManager';
import { GameManager } from '../src/main/services/gameManager';

describe('GameManager', () => {
  let tempDir: string;
  let storage: StorageService;
  let trainerManager: TrainerManager;
  let gameManager: GameManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermanos-game-test-'));
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

  it('creates a game entry with stable ID and timestamps', async () => {
    const fakeGameExe = path.join(tempDir, 'game.exe');
    fs.writeFileSync(fakeGameExe, 'dummy exe content');

    const created = await gameManager.createGame({
      name: 'Witcher 3',
      gameExePath: fakeGameExe
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Witcher 3');
    expect(created.gameExePath).toBe(fakeGameExe);
    expect(created.status).toBe('no_trainer');
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();
  });

  it('rejects game creation with empty name or executable path', async () => {
    await expect(
      gameManager.createGame({ name: '', gameExePath: 'C:\\game.exe' })
    ).rejects.toThrow('Game name is required');

    await expect(
      gameManager.createGame({ name: 'Valid Name', gameExePath: '   ' })
    ).rejects.toThrow('Game executable path is required');
  });

  describe('Dynamic Status Calculation', () => {
    it('detects missing_game when game executable does not exist', async () => {
      const nonExistentGameExe = path.join(tempDir, 'does-not-exist.exe');
      const created = await gameManager.createGame({
        name: 'Missing Game Test',
        gameExePath: nonExistentGameExe
      });

      expect(created.status).toBe('missing_game');
    });

    it('detects no_trainer when game exists but no trainer path is provided', async () => {
      const gameExe = path.join(tempDir, 'valid-game.exe');
      fs.writeFileSync(gameExe, 'game binary');

      const created = await gameManager.createGame({
        name: 'No Trainer Test',
        gameExePath: gameExe
      });

      expect(created.status).toBe('no_trainer');
    });

    it('detects missing_trainer when trainer path is configured but file does not exist', async () => {
      const gameExe = path.join(tempDir, 'valid-game.exe');
      fs.writeFileSync(gameExe, 'game binary');
      const missingTrainerExe = path.join(tempDir, 'missing-trainer.exe');

      const created = await gameManager.createGame({
        name: 'Missing Trainer Test',
        gameExePath: gameExe,
        trainerExePath: missingTrainerExe
      });

      expect(created.status).toBe('missing_trainer');
    });

    it('detects ready when both game and trainer files exist and trainer is not running', async () => {
      const gameExe = path.join(tempDir, 'valid-game.exe');
      const trainerExe = path.join(tempDir, 'valid-trainer.exe');
      fs.writeFileSync(gameExe, 'game binary');
      fs.writeFileSync(trainerExe, 'trainer binary');

      const created = await gameManager.createGame({
        name: 'Ready Test',
        gameExePath: gameExe,
        trainerExePath: trainerExe
      });

      expect(created.status).toBe('ready');
    });
  });

  it('updates an existing game record without duplicating it', async () => {
    const gameExe1 = path.join(tempDir, 'game1.exe');
    fs.writeFileSync(gameExe1, 'content');

    const created = await gameManager.createGame({
      name: 'Initial Name',
      gameExePath: gameExe1
    });

    const updated = await gameManager.updateGame(created.id, {
      name: 'Updated Name'
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('Updated Name');

    const list = await gameManager.listGames();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Updated Name');
  });

  it('CRITICAL SAFETY: deleteGame removes the record but NEVER deletes user files from disk', async () => {
    const gameExe = path.join(tempDir, 'game-to-keep.exe');
    const trainerExe = path.join(tempDir, 'trainer-to-keep.exe');
    fs.writeFileSync(gameExe, 'precious game binary');
    fs.writeFileSync(trainerExe, 'precious trainer binary');

    const created = await gameManager.createGame({
      name: 'Delete Safety Test',
      gameExePath: gameExe,
      trainerExePath: trainerExe
    });

    // Verify files exist prior to deletion
    expect(fs.existsSync(gameExe)).toBe(true);
    expect(fs.existsSync(trainerExe)).toBe(true);

    // Delete record from application
    const deleteResult = await gameManager.deleteGame(created.id);
    expect(deleteResult).toBe(true);

    // Verify library no longer contains game
    const list = await gameManager.listGames();
    expect(list).toHaveLength(0);

    // Verify actual files on disk REMAIN INTACT
    expect(fs.existsSync(gameExe)).toBe(true);
    expect(fs.existsSync(trainerExe)).toBe(true);
    expect(fs.readFileSync(gameExe, 'utf-8')).toBe('precious game binary');
    expect(fs.readFileSync(trainerExe, 'utf-8')).toBe('precious trainer binary');
  });
});
