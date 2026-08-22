# Hermanos Override — Persistent Progress

## Purpose

This file is persistent agent memory for long-running or fresh-context coding sessions.

Update it whenever a meaningful task, phase, architectural decision, blocker, or verification result changes.

## Current State

- Current phase: Phase 10 Complete — Framer Motion & Dynamic Spring Physics Verified
- Current task: Animations and spring physics fully integrated and verified across all test gates
- Status: Complete
- Last updated: 2026-08-21

## Discovered Skill Environment

Discovered and inspected skills in workspace:
- **Primary Design & Visual Architecture Skills for Revision:**
  - `high-end-visual-design` (`.agents/skills/soft-skill`) — Vanguard UI architecture, Ethereal Glass texture archetype, spring physics, fluid motion curves (`[0.16, 1, 0.3, 1]`), and button-in-button trailing pods.
  - `design-taste-frontend` (`.agents/skills/taste-skill`) — Anti-slop frontend engineering, shape consistency lock, pure dark theme lock, and viewport stability.
  - `stitch-design-taste` (`.agents/skills/stitch-skill`) — Semantic tokens, anti-cliché rules, precision monospace telemetry, and glassmorphism styling.
  - `frontend-design` (`.agents/skills/frontend-design`) — Distinctive visual identity, anti-template choices, and intentional typography.
  - `ui-ux-pro-max` (`.agents/skills/ui-ux-pro-max`) — Ergonomic layout discipline, WCAG AA contrast compliance, keyboard focus rings, and safe interactions.
  - `design-system` (`.agents/skills/design-system`) — Three-layer token architecture and semantic CSS variables.
- **Other available skills indexed in workspace:**
  - `academy-guide`, `agy-customizations`, `algorithmic-art`, `antigravity-guide`, `banner-design`, `brand`, `brand-guidelines`, `brandkit`, `brutalist-skill`, `canvas-design`, `claude-api`, `design`, `discernment-nudge`, `doc-coauthoring`, `docx`, `gpt-taste`, `image-to-code`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `internal-comms`, `mcp-builder`, `minimalist-ui`, `pdf`, `pptx`, `redesign-existing-projects`, `skill-creator`, `slack-gif-creator`, `slides`, `design-taste-frontend-v1`, `theme-factory`, `web-artifacts-builder`, `webapp-testing`, `xlsx`.

## Completed Work

### Phases 0–8 — MVP Core Architecture & Gate Verification
- Verified core functional foundation: secure Electron main/preload/renderer boundaries, typed IPC, atomic JSON storage in `%APPDATA%`, GameManager CRUD operations, delete safety guarantee, dynamic 5-state file detection, detached trainer process lifecycle control with Windows `taskkill` tree termination, crash recovery, search filtering, and light/dark theme persistence.
- Verified test suite: 36 of 36 unit and gate tests passing across 5 test suites.
- Verified clean TypeScript compilation and production build.

### Phase 9 — UI/UX Anti-Slop Overhaul (Modern Glassmorphism — Dark Theme Only)
- Rebuilt design tokens for pure OLED dark baseline (`#06080d`), frosted glass panels (`backdrop-blur-xl bg-white/[0.04]`), double-bezel concentric borders (`border-white/10`), inner specular highlights (`shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]`), and calibrated OLED status lights.
- Upgraded UI primitives (`Button`, `Input`, `Modal`, `Badge`, `Toast`), double-bezel game cards, floating header with telemetry, and composed empty states.

### Phase 10 — Framer Motion & Dynamic Spring Physics
- **Ambient Refraction Lighting:** Floating and breathing ambient gradient light orbs in `Shell.tsx` creating natural dynamic highlights through frosted glass panels.
- **Spring Physics Modals & Overlays:** Integrated `AnimatePresence` and spring-physics transitions (`type: 'spring', damping: 26, stiffness: 350`) in `Modal.tsx` and `Toast.tsx`.
- **Card Micro-Physics & Fluid Layout:** Integrated `motion.div` with layout animations (`layout`, `AnimatePresence mode="popLayout"`) in `GameGrid.tsx` and hover elevation lifts (`whileHover={{ y: -3 }}`) on `GameCard.tsx`.
- **Verification:** Verified with `npm run typecheck` (0 errors), `npm test` (36/36 tests passing), and `npm run build` (clean production build).

## Known Issues / Blockers

None. The application is fully animated with Framer Motion and verified.

### Phase 11 — Security, Resilience & Workflow Hardening
- **app-asset protocol hardening:** Restricted the custom protocol to absolute, existing paths with whitelisted image extensions (.png/.jpg/.jpeg/.ico/.gif/.webp), preventing a compromised renderer from exfiltrating arbitrary files from disk.
- **Single-instance lock:** Added pp.requestSingleInstanceLock(); a second launch focuses the existing window instead of creating a duplicate instance that could race on data files or trainer processes.
- **Storage corruption recovery:** loadGames() now backs up corrupt or non-array games.json to a timestamped .corrupt-* file before returning an empty library (previously the next save would silently destroy the user's data) and drops malformed records while keeping valid ones; derived status fields can no longer leak back through disk loads. Extended Electron ambient typings accordingly.
- **IPC payload validation:** All mutating IPC handlers now validate argument shapes before reaching the service layer.
- **Status freshness:** The library re-evaluates dynamic status automatically when the window regains focus (ocus + isibilitychange), so moved/renamed/deleted executables are reflected without manual refresh.
- **Keyboard shortcuts:** Added global Ctrl+N / Cmd+N to open the Add Game dialog alongside the existing Ctrl+K search shortcut.
- **Library sorting:** Games are now sorted alphabetically (locale-aware, case-insensitive).
- **Verification:** Verified with 
pm run typecheck (0 errors), 
pm test (39/39 tests passing, including 4 new storage-resilience tests), and 
pm run build (clean production build).

### Phase 12 — Icon Automation, Safety & Distribution
- **Automatic game icons:** New iconService extracts the embedded icon from the configured game .exe via Electron's pp.getFileIcon (large size) and stores it as PNG under %APPDATA%\Hermanos Override\data\icons\<gameId>.png. Runs on create, and on update whenever the executable changes — unless the user explicitly set or cleared a custom icon in the same edit. Eliminates the manual icon-picker step for most games.
- **Quit safety:** Closing the window while trainers are active now shows a native confirmation dialog ("Stop trainers & exit" / "Cancel") instead of silently terminating processes; TrainerManager.stopAll() is now awaitable and exposes getRunningCount().
- **Performance:** Ambient light orbs are paused when the window loses focus/visibility (the common in-game scenario) and for users with reduced-motion preferences; per-card ackdrop-filter was removed (cards sit over an opaque canvas, so it was pure GPU waste). This addresses perceived lag beyond normal dev-mode overhead (
pm run dev serves unminified modules with HMR; production build is faster).
- **Distribution:** Added electron-builder configuration producing both an NSIS installer (elease/Hermanos Override-Setup-1.0.0.exe) and a portable executable (elease/Hermanos Override-Portable-1.0.0.exe) via 
pm run dist.
- **Verification:** Verified with 
pm run typecheck (0 errors), 
pm test (39/39), 
pm run dist (clean packaging), and a launch test of elease/win-unpacked/Hermanos Override.exe (process started and stayed alive).

### Phase 13 — Workflow Features & Interaction Quality
- **Library export/import:** Header toolbar gained Export/Import actions. Export writes the current sanitized library to a user-chosen .json via a native save dialog; import validates and sanitizes records (malformed entries dropped), replaces the library, and refreshes statuses. Fully offline/local.
- **Toast queue:** Notifications are now a stacked queue (max 5 visible) with per-toast auto-dismiss timers, slide-out dismissal animation, and ria-live announcements, instead of a single slot where rapid messages overwrote each other.
- **Status filters:** Filter chips (All / Ready / Running / Missing) with live counts render above the game grid and compose with search; empty-state copy now distinguishes search misses from filter misses and offers "Clear Filters".
- **Modal accessibility:** Dialogs now trap Tab/Shift+Tab within the dialog, move initial focus to the first form field, and restore focus to the triggering element on close.
- **PID-reuse guard:** Tracked trainer PIDs are periodically re-verified against the process image name via 	asklist; if Windows recycled the PID after a crash, status correctly falls back from "running" with an unexpected-exit notification.
- **Verification:** 
pm run typecheck clean, 39/39 tests passing, production build clean.

### Phase 14 — Performance Pass, Resilience & Desktop Polish
- **Root-cause lag fix:** The three ambient light orbs were large CSS-filtered (lur-[100px+]) surfaces animating continuously *behind* every frosted-glass panel, forcing constant backdrop-filter re-sampling and per-frame Gaussian re-rasterization. Replaced with a static pre-blurred radial-gradient mesh (.glass-mesh-background) — visually equivalent color wash in the same positions, zero ongoing GPU cost. Framer Motion orb code and related state removed.
- **Idle GPU saver:** ody[data-app-hidden='true'] pauses every looping CSS animation (pings, pulses) via nimation-play-state whenever the window loses focus or visibility — the common in-game scenario. Empty-state glow converted from an animated blurred layer to a filter-free gradient.
- **Error boundary:** New top-level ErrorBoundary renders a frosted recovery screen with the error message and a Reload action instead of an unresponsive white window; library data on disk is never affected by renderer crashes.
- **Window persistence:** Window size, position and maximized state are saved to window-state.json (debounced during move/resize, synchronously on close) and restored on launch, validated and clamped to the nearest attached display's work area so the window can never be restored off-screen after a monitor change.
- **Verification:** 
pm run typecheck clean, 39/39 tests passing, production build clean. A brief dev launch smoke test confirmed Electron starts without runtime errors (processes cleaned up afterwards).

### Dark-Only UI Lock
- Removed the light/dark/system ThemeToggle, ThemeContext, and the now-dead settings/titlebar-theme IPC surface (SETTINGS_GET/UPDATE, WINDOW_SET_TITLEBAR_THEME). The application UI is locked to dark mode per product decision; Gate 15 now verifies no theme-switching controls are present instead of testing theme switching.
