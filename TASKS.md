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

- [ ] Verify complete Add Game → Activate Trainer → Stop Trainer workflow.
- [ ] Verify persistence after restart.
- [ ] Verify missing trainer recovery.
- [ ] Verify missing game recovery.
- [ ] Verify invalid path/error handling.
- [ ] Verify delete safety.
- [ ] Verify search behavior.
- [ ] Verify theme behavior.
- [ ] Verify empty state.
- [ ] Verify no critical console/runtime errors.

# Phase 7 — Dedicated Polish Pass

- [ ] Review visual hierarchy.
- [ ] Review spacing consistency.
- [ ] Review typography.
- [ ] Review action clarity.
- [ ] Review status clarity.
- [ ] Review loading and error feedback.
- [ ] Review accessibility basics.
- [ ] Review keyboard/focus behavior where applicable.
- [ ] Review light/dark consistency.
- [ ] Review desktop resizing.
- [ ] Remove unnecessary visual complexity.
- [ ] Remove dead code and unused dependencies.
- [ ] Confirm no out-of-scope features slipped into the MVP.

# Phase 8 — Final Gate

- [ ] Run the complete verification suite from `VERIFY.md`.
- [ ] Run production build.
- [ ] Confirm all MVP tasks are `[x]`.
- [ ] Confirm no `[!]` blockers remain.
- [ ] Update `PROGRESS.md` with final verification results.
- [ ] Only then declare MVP complete.
