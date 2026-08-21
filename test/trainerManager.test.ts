import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { TrainerManager } from '../src/main/services/trainerManager';
import type { TrainerStatusChangeEvent } from '../src/shared/types';

describe('TrainerManager', () => {
  let tempDir: string;
  let trainerManager: TrainerManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermanos-trainer-test-'));
    trainerManager = new TrainerManager();
  });

  afterEach(() => {
    trainerManager.stopAll();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('fails cleanly when trainer executable does not exist', async () => {
    const fakePath = path.join(tempDir, 'nonexistent.exe');
    const result = await trainerManager.launchTrainer('game-1', fakePath);

    expect(result.success).toBe(false);
    expect(result.error).toContain('does not exist');
    expect(trainerManager.isTrainerRunning('game-1')).toBe(false);
  });

  it('launches, tracks, and stops a valid process', async () => {
    // For test process on Windows, cmd.exe / ping / timeout can run briefly
    // On Windows, system32\\cmd.exe is always present
    const isWindows = process.platform === 'win32';
    const testExe = isWindows
      ? 'C:\\Windows\\System32\\cmd.exe'
      : '/bin/sh';

    const events: TrainerStatusChangeEvent[] = [];
    const unsubscribe = trainerManager.onStatusChange((e) => {
      events.push(e);
    });

    const result = await trainerManager.launchTrainer('game-real', testExe);

    expect(result.success).toBe(true);
    expect(result.pid).toBeDefined();

    // Verify status listeners received the running event
    expect(events.some((e) => e.gameId === 'game-real' && e.trainerRunning === true)).toBe(true);

    // Stop trainer
    const stopResult = await trainerManager.stopTrainer('game-real');
    expect(stopResult.success).toBe(true);
    expect(trainerManager.isTrainerRunning('game-real')).toBe(false);

    unsubscribe();
  });

  it('prevents duplicate launch when trainer is already running', async () => {
    const isWindows = process.platform === 'win32';
    const testExe = isWindows
      ? 'C:\\Windows\\System32\\cmd.exe'
      : '/bin/sh';

    const result1 = await trainerManager.launchTrainer('game-dup', testExe);
    expect(result1.success).toBe(true);

    const result2 = await trainerManager.launchTrainer('game-dup', testExe);
    expect(result2.success).toBe(true);
    expect(result2.pid).toBe(result1.pid);

    await trainerManager.stopTrainer('game-dup');
  });
});
