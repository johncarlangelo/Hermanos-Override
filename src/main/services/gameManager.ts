import crypto from 'crypto';
import fs from 'fs';
import type {
  Game,
  GameStatus,
  GameStatusInfo,
  GameWithStatus,
  CreateGameInput,
  UpdateGameInput
} from '../../shared/types';
import { StorageService } from './storageService';
import { TrainerManager } from './trainerManager';

export class GameManager {
  private storage: StorageService;
  private trainerManager: TrainerManager;

  constructor(storage: StorageService, trainerManager: TrainerManager) {
    this.storage = storage;
    this.trainerManager = trainerManager;
  }

  /**
   * Dynamically evaluate current game status based on filesystem and process state.
   */
  public evaluateStatus(game: Game): GameStatusInfo {
    const gameExeExists = Boolean(game.gameExePath && fs.existsSync(game.gameExePath));
    const trainerExeExists = Boolean(
      game.trainerExePath && game.trainerExePath.trim() !== '' && fs.existsSync(game.trainerExePath)
    );
    const trainerRunning = this.trainerManager.isTrainerRunning(game.id);
    const trainerPid = this.trainerManager.getTrainerPid(game.id);

    let status: GameStatus;

    if (!gameExeExists) {
      status = 'missing_game';
    } else if (!game.trainerExePath || game.trainerExePath.trim() === '') {
      status = 'no_trainer';
    } else if (!trainerExeExists) {
      status = 'missing_trainer';
    } else if (trainerRunning) {
      status = 'trainer_running';
    } else {
      status = 'ready';
    }

    return {
      status,
      gameExeExists,
      trainerExeExists,
      trainerRunning,
      trainerPid
    };
  }

  public toGameWithStatus(game: Game): GameWithStatus {
    const statusInfo = this.evaluateStatus(game);
    return {
      ...game,
      status: statusInfo.status,
      trainerPid: statusInfo.trainerPid
    };
  }

  public async listGames(): Promise<GameWithStatus[]> {
    const games = await this.storage.loadGames();
    return games.map((game) => this.toGameWithStatus(game));
  }

  public async getGameById(id: string): Promise<GameWithStatus | null> {
    const games = await this.storage.loadGames();
    const found = games.find((g) => g.id === id);
    if (!found) return null;
    return this.toGameWithStatus(found);
  }

  public async getGameStatus(id: string): Promise<GameStatusInfo> {
    const games = await this.storage.loadGames();
    const found = games.find((g) => g.id === id);
    if (!found) {
      return {
        status: 'missing_game',
        gameExeExists: false,
        trainerExeExists: false,
        trainerRunning: false
      };
    }
    return this.evaluateStatus(found);
  }

  public async createGame(input: CreateGameInput): Promise<GameWithStatus> {
    if (!input.name || !input.name.trim()) {
      throw new Error('Game name is required');
    }
    if (!input.gameExePath || !input.gameExePath.trim()) {
      throw new Error('Game executable path is required');
    }

    const now = new Date().toISOString();
    const newGame: Game = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      gameExePath: input.gameExePath.trim(),
      trainerExePath: input.trainerExePath?.trim() || undefined,
      iconPath: input.iconPath?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };

    const games = await this.storage.loadGames();
    games.push(newGame);
    await this.storage.saveGames(games);

    return this.toGameWithStatus(newGame);
  }

  public async updateGame(id: string, input: UpdateGameInput): Promise<GameWithStatus> {
    const games = await this.storage.loadGames();
    const index = games.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error(`Game with ID "${id}" not found`);
    }

    const current = games[index];

    if (input.name !== undefined && !input.name.trim()) {
      throw new Error('Game name cannot be empty');
    }
    if (input.gameExePath !== undefined && !input.gameExePath.trim()) {
      throw new Error('Game executable path cannot be empty');
    }

    const updated: Game = {
      ...current,
      name: input.name !== undefined ? input.name.trim() : current.name,
      gameExePath: input.gameExePath !== undefined ? input.gameExePath.trim() : current.gameExePath,
      trainerExePath:
        input.trainerExePath === null
          ? undefined
          : input.trainerExePath !== undefined
          ? input.trainerExePath.trim() || undefined
          : current.trainerExePath,
      iconPath:
        input.iconPath === null
          ? undefined
          : input.iconPath !== undefined
          ? input.iconPath.trim() || undefined
          : current.iconPath,
      updatedAt: new Date().toISOString()
    };

    games[index] = updated;
    await this.storage.saveGames(games);

    return this.toGameWithStatus(updated);
  }

  /**
   * Delete a game record.
   * Safety critical: ONLY removes the record from storage.
   * Never deletes or touches the actual files on disk!
   */
  public async deleteGame(id: string): Promise<boolean> {
    // If trainer is running for this game, stop it first
    if (this.trainerManager.isTrainerRunning(id)) {
      await this.trainerManager.stopTrainer(id);
    }

    const games = await this.storage.loadGames();
    const filtered = games.filter((g) => g.id !== id);

    if (filtered.length === games.length) {
      return false;
    }

    await this.storage.saveGames(filtered);
    return true;
  }
}
