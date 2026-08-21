# Hermanos Override — Product Requirements Document

## 1. Product

**Hermanos Override** is a personal, single-user Windows desktop utility for managing and launching locally obtained trainers for single-player PC games.

It is an offline-first personal utility, not a public WeMod competitor.

## 2. Product Philosophy

Build the ideal personal trainer manager rather than reproducing every feature of a third-party platform.

The user manually obtains trainer files and links those local files to game entries.

There are no trainer APIs, automatic downloads, community uploads, accounts, cloud synchronization, or subscriptions in the MVP.

## 3. Target Platform

- Windows desktop
- Electron
- React
- TypeScript
- Vite
- Node.js capabilities in the Electron main process
- Local JSON persistence in the operating system application-data directory

## 4. Architecture

Use a secure Electron boundary:

```text
React Renderer
    ↓
Preload / IPC
    ↓
Electron Main Process
    ↓
Filesystem / Process Management
```

The renderer must not directly access Node filesystem APIs or arbitrary process spawning.

Use a narrow preload/IPC API.

Conceptual service boundaries may include:

- `gameManager`
- `trainerManager`
- `storageService`

## 5. Game Record

A game record must contain at least:

- stable unique ID
- game name
- game executable path
- optional trainer executable path
- optional icon path
- created timestamp
- updated timestamp

Do not persist derived status.

## 6. Dynamic Status

Status must be calculated from actual filesystem/process state.

Expected logical states:

1. **Missing Game** — configured game executable does not exist.
2. **No Trainer Yet** — game exists but no trainer path is configured.
3. **Missing Trainer** — trainer path is configured but the trainer executable no longer exists.
4. **Trainer Running** — trainer executable exists and its process is currently running.
5. **Ready** — game and trainer executables exist and the trainer is not running.

Status should drive the UI rather than being manually stored as a permanent field.

## 7. Main Library

The main screen must provide:

- Hermanos Override branding
- Add Game action
- search
- responsive game grid/list appropriate for desktop
- game cards
- status indicators
- primary contextual action
- edit/delete actions
- empty state

The exact visual design is intentionally delegated to the agent.

The interface should feel like a polished professional desktop utility, not a marketing site or stereotypical gaming UI.

Avoid:

- neon gaming aesthetics
- excessive gradients
- glowing effects
- sci-fi/HUD styling
- excessive visual noise

Prioritize:

- clarity
- usability
- professional polish
- accessibility
- visual hierarchy
- desktop efficiency
- consistency
- coherent design system

## 8. Game Card Actions

### Ready

Primary action: `Activate trainer`

### Trainer Running

Primary action: `Stop trainer`

### No Trainer Yet

Primary action may be equivalent to `Find trainer`.

### Missing Trainer

Primary action: `Relink trainer`

### Missing Game

Activation must be prevented; editing/relinking should remain possible.

## 9. Add/Edit Game

Required:

- game name
- game executable

Optional:

- trainer executable
- icon

Use native file pickers.

Editing should reuse the same general form/component and populate existing values.

Deleting a game entry requires confirmation.

Deleting an entry must NEVER delete the actual game or trainer files from disk.

## 10. Persistence

Persist user data in the Windows application-data directory rather than inside the repository.

Example:

```text
%APPDATA%/
└── Hermanos Override/
    └── data/
        ├── games.json
        └── settings.json
```

The library must survive application restarts.

## 11. Trainer Process Management

The MVP must:

1. validate the trainer path;
2. launch the trainer executable;
3. track the actual trainer process;
4. display `Trainer running` while it is running;
5. allow the user to stop the trainer;
6. detect unexpected trainer exit;
7. return to the appropriate non-running state.

The UI must not assume that clicking launch means the process successfully started.

## 12. Empty State

When there are no games, provide a clear empty state and a primary Add Game action.

The exact copy and design are up to the implementing agent.

## 13. MVP Scope

### Foundation

- Electron application
- React + TypeScript
- desktop window
- theme infrastructure
- persistent local data

### Game Library

- add
- edit
- delete
- search
- cards
- empty state
- dynamic status

### File Management

- native game `.exe` picker
- native trainer picker
- path validation
- missing-file detection
- relinking

### Trainer Management

- launch trainer executable
- process tracking
- stop trainer
- process exit detection
- state synchronization
- error handling

### UX

- loading states
- error states
- confirmation dialogs
- light/dark theme
- professional desktop UI
- responsive desktop resizing
- accessibility basics

## 14. Explicitly Out of Scope

Do not implement:

- online APIs
- automatic trainer downloads
- accounts/authentication
- cloud sync
- community marketplace
- community uploads
- memory scanning
- Cheat Engine integration
- custom memory editing
- hotkeys
- multiple trainers per game
- trainer version management
- game launching
- mod management
- automatic updater
- cloud services

## 15. Completion Workflow

The complete MVP should support:

```text
Launch
  ↓
Empty state
  ↓
Add Game
  ↓
Enter game name
  ↓
Select game .exe
  ↓
Optionally select trainer .exe
  ↓
Save
  ↓
Game appears
  ↓
Status is calculated
  ↓
Activate trainer
  ↓
Trainer launches
  ↓
Status becomes Trainer Running
  ↓
Stop trainer
  ↓
Status returns to Ready
  ↓
Restart application
  ↓
Game remains configured
```

Recovery workflows:

```text
Trainer moved/deleted
  ↓
Missing Trainer
  ↓
Relink trainer
  ↓
Ready
```

and:

```text
Game moved/deleted
  ↓
Missing Game
  ↓
Edit game
  ↓
Select new executable
  ↓
Ready
```
