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
}

export class TrainerManager {
  private runningTrainers = new Map<string, RunningTrainerInfo>();
  private statusListeners: Array<(event: TrainerStatusChangeEvent) => void> = [];

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

    // Check if the process is alive
    try {
      // process.kill with signal 0 checks existence without killing
      process.kill(info.pid, 0);
      return true;
    } catch {
      // Process no longer exists
      this.runningTrainers.delete(gameId);
      return false;
    }
  }

  public getTrainerPid(gameId: string): number | undefined {
    return this.runningTrainers.get(gameId)?.pid;
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
        isStoppingManually: false
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

      child.on('error', (err) => {
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

  public stopAll(): void {
    for (const [gameId] of this.runningTrainers) {
      this.stopTrainer(gameId).catch(() => {});
    }
  }
}
