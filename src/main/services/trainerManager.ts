import { spawn, ChildProcess, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import type {
  TrainerLaunchResult,
  TrainerStopResult,
  TrainerStatusChangeEvent
} from '../../shared/types';

const execAsync = promisify(exec);

interface RunningTrainerInfo {
  gameId: string;
  process: ChildProcess;
  pid: number;
  trainerPath: string;
  isStoppingManually: boolean;
  /** Timestamp of the last successful deep identity verification (ms epoch). */
  lastVerifiedAt?: number;
}

const VERIFY_CACHE_MS = 5000;

export class TrainerManager {
  private runningTrainers = new Map<string, RunningTrainerInfo>();
  private statusListeners: Array<(event: TrainerStatusChangeEvent) => void> = [];

  /**
   * Guard against PID reuse: after a trainer crashes, Windows can recycle
   * its PID for an unrelated process, making `process.kill(pid, 0)` succeed
   * and falsely report "running". On Windows we verify the process image
   * name still matches the trainer executable.
   */
  private async pidBelongsToTrainer(info: RunningTrainerInfo): Promise<boolean> {
    if (process.platform !== 'win32') return true;

    try {
      const { stdout } = await execAsync(
        `tasklist /FI "PID eq ${info.pid}" /FO CSV /NH`,
        { windowsHide: true }
      );
      const line = stdout.split(/\r?\n/).find((l) => l.trim().startsWith('"'));
      if (!line) return false;

      const imageName = line.split('","')[0].replace(/^"/, '').toLowerCase();
      const expected = path.basename(info.trainerPath).toLowerCase();
      return imageName === expected;
    } catch {
      // tasklist failure: fall back to treating the PID as valid rather than
      // killing a possibly-valid session on a transient command error.
      return true;
    }
  }

  public onStatusChange(listener: (event: TrainerStatusChangeEvent) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(event: TrainerStatusChangeEvent): void {
    for (const listener of this.statusListeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in status change listener:', err);
      }
    }
  }

  public isTrainerRunning(gameId: string): boolean {
    const info = this.runningTrainers.get(gameId);
    if (!info) return false;

    // Cheap liveness check
    try {
      process.kill(info.pid, 0);
    } catch {
      this.runningTrainers.delete(gameId);
      return false;
    }

    // Periodic identity re-verification (throttled) to detect PID reuse.
    if (Date.now() - (info.lastVerifiedAt ?? 0) > VERIFY_CACHE_MS) {
      info.lastVerifiedAt = Date.now();
      this.pidBelongsToTrainer(info)
        .then((valid) => {
          if (valid) return;
          if (this.runningTrainers.get(gameId) === info) {
            this.runningTrainers.delete(gameId);
            this.notifyListeners({
              gameId,
              status: 'ready',
              trainerRunning: false,
              unexpectedExit: true,
              error: 'Trainer process ended unexpectedly.'
            });
          }
        })
        .catch(() => {});
    }

    return true;
  }

  public getTrainerPid(gameId: string): number | undefined {
    return this.runningTrainers.get(gameId)?.pid;
  }

  public getRunningCount(): number {
    let count = 0;
    for (const [gameId] of this.runningTrainers) {
      if (this.isTrainerRunning(gameId)) count++;
    }
    return count;
  }

  public async launchTrainer(
    gameId: string,
    trainerExePath: string
  ): Promise<TrainerLaunchResult> {
    if (!trainerExePath || typeof trainerExePath !== 'string') {
      return { success: false, error: 'Trainer executable path is required' };
    }

    // Check file existence
    if (!fs.existsSync(trainerExePath)) {
      return {
        success: false,
        error: `Trainer executable does not exist at path: ${trainerExePath}`
      };
    }

    // Check if already running for this game
    if (this.isTrainerRunning(gameId)) {
      const currentPid = this.runningTrainers.get(gameId)?.pid;
      return {
        success: true,
        pid: currentPid
      };
    }

    try {
      const workingDir = path.dirname(trainerExePath);
      const child = spawn(trainerExePath, [], {
        cwd: workingDir,
        detached: true,
        stdio: 'ignore'
      });

      if (!child.pid) {
        return {
          success: false,
          error: 'Failed to obtain process ID for launched trainer'
        };
      }

      const pid = child.pid;
      // Allow the parent to exit without waiting for the child process if detached
      child.unref();

      const runningInfo: RunningTrainerInfo = {
        gameId,
        process: child,
        pid,
        trainerPath: trainerExePath,
        isStoppingManually: false,
        lastVerifiedAt: Date.now()
      };

      this.runningTrainers.set(gameId, runningInfo);

      // Handle process exit / close
      const handleExit = (code: number | null, _signal: string | null) => {
        const current = this.runningTrainers.get(gameId);
        if (!current) return;

        const wasManual = current.isStoppingManually;
        this.runningTrainers.delete(gameId);

        this.notifyListeners({
          gameId,
          status: 'ready',
          trainerRunning: false,
          unexpectedExit: !wasManual,
          error:
            !wasManual && code !== null && code !== 0
              ? `Trainer exited unexpectedly with code ${code}`
              : undefined
        });
      };

      child.on('exit', handleExit);
      child.on('close', handleExit);

      child.on('error', (err: Error) => {
        console.error(`Trainer process error for game ${gameId}:`, err);
        this.runningTrainers.delete(gameId);
        this.notifyListeners({
          gameId,
          status: 'ready',
          trainerRunning: false,
          unexpectedExit: true,
          error: `Trainer process encountered an error: ${err.message}`
        });
      });

      // Notify that trainer is running
      this.notifyListeners({
        gameId,
        status: 'trainer_running',
        trainerRunning: true,
        pid
      });

      return {
        success: true,
        pid
      };
    } catch (err: any) {
      console.error('Failed to spawn trainer:', err);
      return {
        success: false,
        error: err?.message || 'Unknown error while launching trainer process'
      };
    }
  }

  public async stopTrainer(gameId: string): Promise<TrainerStopResult> {
    const info = this.runningTrainers.get(gameId);
    if (!info) {
      return { success: true };
    }

    info.isStoppingManually = true;

    try {
      const pid = info.pid;

      if (process.platform === 'win32') {
        try {
          // Use taskkill on Windows to cleanly terminate the process tree
          await execAsync(`taskkill /PID ${pid} /T /F`);
        } catch (killErr: any) {
          // If already terminated, that's fine
          if (!killErr.message?.includes('not found') && !killErr.message?.includes('no running instance')) {
            // Try standard kill
            try {
              process.kill(pid, 'SIGKILL');
            } catch {
              // ignore
            }
          }
        }
      } else {
        try {
          process.kill(pid, 'SIGTERM');
        } catch {
          try {
            process.kill(pid, 'SIGKILL');
          } catch {
            // ignore
          }
        }
      }

      this.runningTrainers.delete(gameId);

      this.notifyListeners({
        gameId,
        status: 'ready',
        trainerRunning: false,
        unexpectedExit: false
      });

      return { success: true };
    } catch (err: any) {
      console.error(`Failed to stop trainer for game ${gameId}:`, err);
      this.runningTrainers.delete(gameId);
      return {
        success: false,
        error: err?.message || 'Failed to stop trainer process'
      };
    }
  }

  public async stopAll(): Promise<void> {
    const gameIds = [...this.runningTrainers.keys()];
    await Promise.all(
      gameIds.map((gameId) => this.stopTrainer(gameId).catch(() => {}))
    );
  }
}
