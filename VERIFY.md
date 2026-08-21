# Hermanos Override — Verification Contract

## Core Rule

A feature is not complete because the implementation looks correct.

A feature is complete when its acceptance criteria can be demonstrated by executable tests, application interaction, or another objective verification method.

Do not weaken verification to make the project pass.

---

# Gate 1 — Static / Build Verification

The project must have working commands for the applicable checks.

Required checks:

- TypeScript/type checking passes.
- Lint passes if configured.
- Unit/integration tests pass if applicable.
- Production build succeeds.
- No unresolved compile errors remain.

If a command does not exist yet, create the appropriate project test infrastructure rather than silently skipping the requirement.

---

# Gate 2 — Application Startup

Verify:

- Application launches successfully.
- Main window appears.
- Renderer loads without a fatal error.
- No critical startup exception occurs.
- IPC/preload initialization succeeds.

---

# Gate 3 — Empty State

With an empty data store:

- Application shows the intended empty state.
- Add Game is visible and usable.
- No fake/mock game data is presented as real user data.

---

# Gate 4 — Add Game

Verify:

- Add Game opens.
- Game name is required.
- Game executable is required.
- Trainer executable is optional.
- Native file picker works.
- Valid selections can be saved.
- Invalid/missing selections are handled clearly.
- Saved game appears in the library.
- Correct initial status is displayed.

---

# Gate 5 — Edit Game

Verify:

- Existing values are populated.
- Game name can be changed.
- Game executable can be changed.
- Trainer executable can be changed/relinked.
- Editing updates the existing record rather than creating a duplicate.
- Updated values survive application restart.

---

# Gate 6 — Delete Safety

Verify:

- Delete requires confirmation.
- Cancel preserves the record.
- Confirm removes only the application record.
- The actual game executable remains untouched.
- The actual trainer executable remains untouched.
- No referenced user files are deleted by the application.

---

# Gate 7 — Dynamic Status

Test all logical states:

1. Missing Game
2. No Trainer Yet
3. Missing Trainer
4. Ready
5. Trainer Running

Verify status is derived from actual current filesystem/process state.

Do not rely on a stale persisted `status` field.

---

# Gate 8 — Trainer Launch

Use a safe local test executable or test process where appropriate.

Verify:

- Launch is prevented when required files are missing.
- Launch starts the intended trainer process.
- Launch failures produce useful feedback.
- UI changes to Trainer Running only when the process is actually running.
- Duplicate launch behavior is handled safely.

---

# Gate 9 — Trainer Stop

Verify:

- Stop Trainer terminates the tracked trainer process.
- UI does not claim the process stopped before it actually stops.
- Status returns to the appropriate non-running state.
- Stop failures are handled without corrupting application state.

---

# Gate 10 — Unexpected Process Exit

Verify:

- Trainer exits without the user pressing Stop.
- Application detects the exit.
- UI leaves Trainer Running state.
- Correct non-running status is restored.

---

# Gate 11 — Persistence

Verify:

1. Create a game.
2. Close the application.
3. Reopen it.
4. Confirm the game remains.
5. Confirm its paths remain.
6. Confirm status is recalculated from the current filesystem/process state.

Persistence must use the OS application-data directory.

---

# Gate 12 — Missing Trainer Recovery

Test:

1. Configure a valid trainer.
2. Confirm Ready.
3. Move/delete the trainer outside the application.
4. Reopen or refresh state.
5. Confirm Missing Trainer.
6. Relink the trainer.
7. Confirm Ready.

---

# Gate 13 — Missing Game Recovery

Test:

1. Configure a valid game executable.
2. Confirm Ready.
3. Move/delete the game executable outside the application.
4. Confirm Missing Game.
5. Edit the game.
6. Select a new valid executable.
7. Confirm the correct recovered state.

---

# Gate 14 — Search

Verify:

- Search filters the library correctly.
- Search is case-insensitive unless a deliberate product decision says otherwise.
- Clearing search restores the library.
- Search does not mutate stored data.
- Empty search results have useful feedback.

---

# Gate 15 — UI / UX Review

Perform a dedicated review of:

- hierarchy
- spacing
- typography
- component consistency
- action clarity
- status visibility
- loading states
- error states
- empty states
- confirmation dialogs
- focus behavior
- accessibility basics
- light theme
- dark theme
- desktop resizing
- visual clutter

The UI should feel like a professional desktop utility, not a gaming landing page.

---

# Gate 16 — Scope Audit

Confirm that the MVP does NOT contain:

- online trainer APIs
- automatic trainer downloads
- accounts
- cloud sync
- community marketplace
- memory scanning
- Cheat Engine integration
- custom memory editing
- hotkey systems
- multiple trainers per game
- trainer version management
- game launching
- mod management
- automatic updater
- cloud services

---

# Final Gate

The MVP may only be declared complete when:

- all required gates pass;
- all MVP tasks are marked `[x]`;
- production build succeeds;
- no known critical blockers remain;
- the complete workflow has been exercised;
- recovery workflows have been exercised;
- the final UI/UX review has been performed.

Final output should include a concise verification summary and any known non-critical limitations.
