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

- [ ] Establish the clean application structure.
- [ ] Establish Electron main/preload/renderer boundaries.
- [ ] Establish secure IPC conventions.
- [ ] Establish TypeScript configuration.
- [ ] Establish application-wide design tokens/design system.
- [ ] Establish typography, spacing, component, and interaction conventions.
- [ ] Establish light/dark theme infrastructure.
- [ ] Build the new application shell from scratch.
- [ ] Create the initial empty library experience.
- [ ] Verify the app starts without runtime errors.

# Phase 2 — Persistence

- [ ] Define the game data model.
- [ ] Implement stable IDs and timestamps.
- [ ] Implement JSON persistence under the OS application-data directory.
- [ ] Implement load-on-start.
- [ ] Implement save/update behavior.
- [ ] Implement game create operation.
- [ ] Implement game update operation.
- [ ] Implement game delete operation.
- [ ] Verify application restart preserves game data.
- [ ] Verify deleting an entry never deletes referenced files.

# Phase 3 — Product UI

- [ ] Design and implement the main game library.
- [ ] Implement game cards.
- [ ] Implement contextual status presentation.
- [ ] Implement search.
- [ ] Implement empty state.
- [ ] Implement Add Game flow.
- [ ] Implement Edit Game flow.
- [ ] Implement delete confirmation.
- [ ] Implement loading states.
- [ ] Implement recoverable error states.
- [ ] Implement missing-file UI.
- [ ] Implement light/dark theme behavior.
- [ ] Verify desktop resizing and layout behavior.
- [ ] Perform an independent UI/UX review.

# Phase 4 — File Detection

- [ ] Implement native game executable picker.
- [ ] Implement native trainer executable picker.
- [ ] Validate selected paths.
- [ ] Detect missing game executable dynamically.
- [ ] Detect missing trainer dynamically.
- [ ] Implement relink trainer behavior.
- [ ] Implement relink game behavior.
- [ ] Verify status does not depend on persisted derived state.

# Phase 5 — Trainer Process Management

- [ ] Implement trainer process launch.
- [ ] Validate launch failures.
- [ ] Track the actual process.
- [ ] Synchronize running state with the process.
- [ ] Implement Stop Trainer.
- [ ] Detect unexpected trainer exit.
- [ ] Return to the correct non-running status.
- [ ] Handle already-running / duplicate-launch edge cases.
- [ ] Handle process termination errors safely.

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
