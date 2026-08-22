# Hermanos Override — Task Queue

## How to use this file

Work from top to bottom unless a dependency requires otherwise.

- `[ ]` = not complete
- `[~]` = in progress
- `[x]` = verified complete
- `[!]` = blocked

A task may only become `[x]` after its acceptance criteria are verified.

Do not mark parent tasks complete while child requirements remain unverified.

---

# Phase 0 — Repository Reconnaissance
 
- [x] Inspect the existing repository structure and current Electron/React/Vite setup.
- [x] Enumerate workspace-discoverable skills and record relevant skills in `PROGRESS.md`.
- [x] Identify existing dependencies worth retaining.
- [x] Identify obsolete UI, mock data, and components that should be removed.
- [x] Confirm the application currently has a clean baseline build/start command.
- [x] Document the architectural starting point in `PROGRESS.md`.

# Phase 1 — Foundation

- [x] Establish the clean application structure.
- [x] Establish Electron main/preload/renderer boundaries.
- [x] Establish secure IPC conventions.
- [x] Establish TypeScript configuration.
- [x] Establish application-wide design tokens/design system.
- [x] Establish typography, spacing, component, and interaction conventions.
- [x] Establish light/dark theme infrastructure.
- [x] Build the new application shell from scratch.
- [x] Create the initial empty library experience.
- [x] Verify the app starts without runtime errors.

# Phase 2 — Persistence

- [x] Define the game data model.
- [x] Implement stable IDs and timestamps.
- [x] Implement JSON persistence under the OS application-data directory.
- [x] Implement load-on-start.
- [x] Implement save/update behavior.
- [x] Implement game create operation.
- [x] Implement game update operation.
- [x] Implement game delete operation.
- [x] Verify application restart preserves game data.
- [x] Verify deleting an entry never deletes referenced files.

# Phase 3 — Product UI

- [x] Design and implement the main game library.
- [x] Implement game cards.
- [x] Implement contextual status presentation.
- [x] Implement search.
- [x] Implement empty state.
- [x] Implement Add Game flow.
- [x] Implement Edit Game flow.
- [x] Implement delete confirmation.
- [x] Implement loading states.
- [x] Implement recoverable error states.
- [x] Implement missing-file UI.
- [x] Implement light/dark theme behavior.
- [x] Verify desktop resizing and layout behavior.
- [x] Perform an independent UI/UX review.

# Phase 4 — File Detection

- [x] Implement native game executable picker.
- [x] Implement native trainer executable picker.
- [x] Validate selected paths.
- [x] Detect missing game executable dynamically.
- [x] Detect missing trainer dynamically.
- [x] Implement relink trainer behavior.
- [x] Implement relink game behavior.
- [x] Verify status does not depend on persisted derived state.

# Phase 5 — Trainer Process Management

- [x] Implement trainer process launch.
- [x] Validate launch failures.
- [x] Track the actual process.
- [x] Synchronize running state with the process.
- [x] Implement Stop Trainer.
- [x] Detect unexpected trainer exit.
- [x] Return to the correct non-running status.
- [x] Handle already-running / duplicate-launch edge cases.
- [x] Handle process termination errors safely.

# Phase 6 — Integration Verification

- [x] Verify complete Add Game → Activate Trainer → Stop Trainer workflow.
- [x] Verify persistence after restart.
- [x] Verify missing trainer recovery.
- [x] Verify missing game recovery.
- [x] Verify invalid path/error handling.
- [x] Verify delete safety.
- [x] Verify search behavior.
- [x] Verify theme behavior.
- [x] Verify empty state.
- [x] Verify no critical console/runtime errors.

# Phase 7 — Dedicated Polish Pass

- [x] Review visual hierarchy.
- [x] Review spacing consistency.
- [x] Review typography.
- [x] Review action clarity.
- [x] Review status clarity.
- [x] Review loading and error feedback.
- [x] Review accessibility basics.
- [x] Review keyboard/focus behavior where applicable.
- [x] Review light/dark consistency.
- [x] Review desktop resizing.
- [x] Remove unnecessary visual complexity.
- [x] Remove dead code and unused dependencies.
- [x] Confirm no out-of-scope features slipped into the MVP.

# Phase 8 — Final Gate

- [x] Run the complete verification suite from `VERIFY.md`.
- [x] Run production build.
- [x] Confirm all MVP tasks are `[x]`.
- [x] Confirm no `[!]` blockers remain.
- [x] Update `PROGRESS.md` with final verification results.
- [x] Only then declare MVP complete.

# Phase 9 — UI/UX Anti-Slop Overhaul (Modern Glassmorphism — Dark Theme Only)

- [x] Establish Modern Frosted Glassmorphism design tokens in `index.css` (pure dark OLED baseline `#06080d`, frosted glass surfaces, backdrop-filter blur `backdrop-blur-xl`, `border-white/10` hairlines, and `shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]` highlights).
- [x] Lock application to a pure dark theme (removing light mode artifacts and ensuring all components conform to dark frosted aesthetics).
- [x] Upgrade UI primitives (`Button`, `Input`, `Modal`, `Badge`, `Toast`) with glassmorphism styling, translucent fills, tactile micro-physics, and double-bezel concentric curves.
- [x] Redesign application Header and Navigation as a floating frosted glass control bar with integrated search shortcut pills (`Ctrl+K`), live status counter pills, and refined window drag controls.
- [x] Redesign GameCard with modern double-bezel frosted glass trays, glowing OLED status indicators, precision monospace telemetry, and translucent button-in-button action layout.
- [x] Redesign empty library and empty search result states with ethereal glass illustration cards, glowing accents, and crisp typography.
- [x] Redesign Add/Edit Game Modal and Delete Confirmation as high-end frosted glass overlays with hardware-grade inputs and prominent disk safety indicators.
- [x] Verify responsive layout across compact, medium, and ultra-wide desktop viewports without blur performance penalties.
- [x] Run full verification test suite (`npm test`), TypeScript check (`npm run typecheck`), and production build (`npm run build`).

# Phase 10 — Framer Motion & Dynamic Spring Physics

- [x] Integrate Framer Motion ambient background mesh with floating refraction lighting.
- [x] Implement staggered entrance animations and layout transitions (`AnimatePresence`, `layout`) in GameGrid.
- [x] Implement spring physics and micro-interactions on GameCard (elevation hover, activity pulse).
- [x] Implement spring physics on Modal dialog entrances and dismissals (`AnimatePresence`).
- [x] Implement spring slide-in and exit animations on Toast notifications.
- [x] Verify test suite and TypeScript compilation with zero animation-induced test regressions.

# Phase 11 — Security, Resilience & Workflow Hardening

- [x] Restrict the `app-asset` protocol to whitelisted image files at absolute paths.
- [x] Add a single-instance application lock with second-instance focus behavior.
- [x] Back up corrupt `games.json` before recovery and drop malformed records safely.
- [x] Validate IPC handler payload shapes before reaching the service layer.
- [x] Re-evaluate dynamic status automatically when the window regains focus.
- [x] Add global `Ctrl+N` Add Game shortcut alongside `Ctrl+K` search.
- [x] Sort the library alphabetically.
- [x] Extend storage-resilience unit tests and re-run full verification.

# Phase 12 — Icon Automation, Safety & Distribution

- [x] Auto-extract the embedded icon from game executables via `app.getFileIcon`.
- [x] Persist extracted icons under `%APPDATA%\Hermanos Override\data\icons\`.
- [x] Re-extract icons when the game executable changes unless the user explicitly set or cleared an icon.
- [x] Confirm before closing the app while trainer processes are active.
- [x] Pause ambient background animations when the window is unfocused or reduced motion is preferred.
- [x] Remove per-card backdrop-filter GPU cost without visual regression.
- [x] Configure electron-builder packaging (NSIS installer + portable executable).
- [x] Verify packaged application launches successfully.
