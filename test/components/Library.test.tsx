import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/renderer/App';
import type { GameWithStatus } from '../../src/shared/types';
import type { ElectronAPI } from '../../src/shared/ipc';

describe('Library UI Integration', () => {
  let mockElectronAPI: ElectronAPI;
  let mockGames: GameWithStatus[];

  beforeEach(() => {
    mockGames = [
      {
        id: '1',
        name: 'Cyberpunk 2077',
        gameExePath: 'C:\\Games\\Cyberpunk.exe',
        trainerExePath: 'C:\\Trainers\\CyberpunkTrainer.exe',
        status: 'ready',
        createdAt: '2026-08-21T00:00:00.000Z',
        updatedAt: '2026-08-21T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Hades II',
        gameExePath: 'C:\\Games\\Hades2.exe',
        trainerExePath: undefined,
        status: 'no_trainer',
        createdAt: '2026-08-21T00:00:00.000Z',
        updatedAt: '2026-08-21T00:00:00.000Z'
      }
    ];

    mockElectronAPI = {
      listGames: vi.fn().mockImplementation(() => Promise.resolve(mockGames)),
      createGame: vi.fn().mockImplementation((input) =>
        Promise.resolve({
          id: '3',
          ...input,
          status: 'no_trainer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      ),
      updateGame: vi.fn().mockImplementation((id, input) =>
        Promise.resolve({
          ...mockGames.find((g) => g.id === id),
          ...input,
          status: 'ready'
        })
      ),
      deleteGame: vi.fn().mockImplementation(() => Promise.resolve(true)),
      getGameStatus: vi.fn().mockImplementation(() =>
        Promise.resolve({
          status: 'ready',
          gameExeExists: true,
          trainerExeExists: true,
          trainerRunning: false
        })
      ),
      refreshGames: vi.fn().mockImplementation(() => Promise.resolve(mockGames)),
      launchTrainer: vi.fn().mockImplementation(() => Promise.resolve({ success: true, pid: 1234 })),
      stopTrainer: vi.fn().mockImplementation(() => Promise.resolve({ success: true })),
      onTrainerStatusChange: vi.fn().mockImplementation(() => () => {}),
      selectFile: vi.fn().mockImplementation(() => Promise.resolve('C:\\Games\\Selected.exe')),
      exportLibrary: vi.fn().mockImplementation(() => Promise.resolve({ success: true, count: mockGames.length })),
      importLibrary: vi.fn().mockImplementation(() => Promise.resolve({ success: true, count: mockGames.length })),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      closeWindow: vi.fn()
    };

    window.electronAPI = mockElectronAPI;
  });

  it('renders application header and library items', async () => {
    render(<App />);

    expect(screen.getAllByText('Hermanos Override').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
      expect(screen.getByText('Hades II')).toBeInTheDocument();
    });
  });

  it('filters game cards by search input case-insensitively', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search library...');
    fireEvent.change(searchInput, { target: { value: 'hades' } });

    await waitFor(() => {
      expect(screen.queryByText('Cyberpunk 2077')).not.toBeInTheDocument();
      expect(screen.getByText('Hades II')).toBeInTheDocument();
    });
  });

  it('displays empty state when no games exist', async () => {
    mockElectronAPI.listGames = vi.fn().mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No games in your library yet')).toBeInTheDocument();
      expect(screen.getByText('Add Your First Game')).toBeInTheDocument();
    });
  });

  it('opens the Add Game modal on button click', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByText('Add Game');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Add New Game')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Cyberpunk 2077, Elden Ring')).toBeInTheDocument();
    });
  });
});
