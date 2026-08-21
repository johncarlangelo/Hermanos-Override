# Hermanos Override — Autonomous Engineering Loop

## Purpose

This document defines the behavior expected when Hermanos Override is operated
through the external autonomous loop driver.

The external loop driver is responsible for repeatedly invoking Antigravity CLI.

The Antigravity main agent is responsible for deciding what engineering work
should be performed during each invocation.

The agent must never depend on the human providing a "continue" instruction
between tasks or phases.

`TASKS.md` is the persistent source of truth for unfinished work.

## Loop

Repeat the following cycle:

1. Read the current repository state.
2. Read `AGENTS.md`.
3. Read the relevant sections of `PRD.md`, `TASKS.md`, `VERIFY.md`,
   `PROGRESS.md`, and `DECISIONS.md`.
4. Identify the highest-priority unfinished task whose dependencies are satisfied.
5. Mark that task `[~]`.
6. Inspect available skills and use relevant skills.
7. Determine whether a specialized subagent should be delegated work.
8. Implement the task.
9. Run the task's required verification.
10. If verification fails:
    - diagnose the failure;
    - fix the implementation;
    - verify again.
11. If verification succeeds:
    - mark the task `[x]`;
    - update `PROGRESS.md`;
    - record important architectural decisions in `DECISIONS.md`;
    - inspect the Git diff;
    - create a concise Conventional Commit.
12. Continue immediately with the next unfinished task.

Do not wait for user confirmation between successful tasks or phases.

## Subagent Policy

Use specialized subagents when they provide meaningful independent analysis,
implementation support, or verification.

Prefer:

- `architecture-reviewer` for architecture and Electron boundary decisions;
- `ui-reviewer` for independent UI/UX review;
- `verifier` for independent verification and evidence gathering.

Do not delegate trivial work unnecessarily.

Subagent output is evidence or recommendations. The main agent remains
responsible for the final implementation and verification.

## Skill Policy

Before each non-trivial task:

1. Inspect the available skills.
2. Determine which skills are relevant.
3. Use applicable skills.
4. Follow their instructions.
5. Do not invoke unrelated skills simply to use them.

## Verification Policy

A task is not complete because the implementation looks correct.

A task becomes `[x]` only after its acceptance criteria have been verified.

Prefer:

- executable tests;
- type checking;
- production builds;
- application startup;
- actual application interaction;
- independent verifier review where appropriate.

Never weaken verification criteria to obtain a passing result.

## Failure Recovery

If verification fails:

1. Diagnose the actual failure.
2. Fix the underlying problem.
3. Re-run verification.

If the same failure occurs repeatedly, stop changing unrelated code.

After repeated unsuccessful attempts:

- document the blocker in `PROGRESS.md`;
- identify what was attempted;
- preserve the relevant failure evidence;
- stop the loop if the blocker cannot be autonomously resolved.

## Context Recovery

If context is compacted, interrupted, or uncertain:

1. Re-read `AGENTS.md`.
2. Re-read `TASKS.md`.
3. Re-read `PROGRESS.md`.
4. Re-read the relevant sections of `VERIFY.md`, `PRD.md`, and `DECISIONS.md`.
5. Inspect the actual repository and Git state.
6. Resume from the first unfinished task.

Never reconstruct project state from conversational memory when persistent
project state is available.

## Git Policy

After a logically meaningful verified unit of work:

1. Inspect `git diff`.
2. Ensure only intended changes are included.
3. Create a concise Conventional Commit.

Commit format:

`<type>: <short imperative description>`

Examples:

- `feat: add game persistence`
- `feat: build game library`
- `fix: handle missing trainer`
- `refactor: simplify IPC layer`
- `test: add persistence checks`

Commit messages must be one line.

Do not create verbose commit bodies.

Do not commit incomplete or unverified work.

## Push Policy

Do not push after every individual task.

Push at logical checkpoints such as:

- completion of a major phase;
- completion of a major feature group;
- successful integration verification;
- final MVP verification.

Before pushing:

1. Confirm the working tree is clean.
2. Confirm the relevant verification has passed.
3. Push the verified commits to the configured remote.

Do not rewrite published history unless explicitly required.

## Completion

The loop continues until one of these conditions occurs:

### SUCCESS

All MVP tasks are `[x]`, the complete `VERIFY.md` procedure passes,
the production build succeeds, and no critical issues remain.

Then:

1. Update `PROGRESS.md`.
2. Create the final concise Conventional Commit if necessary.
3. Push the verified final state.
4. Report completion.

### BLOCKED

A genuine blocker cannot be resolved autonomously.

Then:

1. Document the blocker in `PROGRESS.md`.
2. Preserve useful failure evidence.
3. Do not falsely mark the task complete.
4. Stop and report the blocker.

### SAFETY LIMIT

The configured autonomous iteration limit is reached.

Then:

1. Update `PROGRESS.md`.
2. Record the current task and verification state.
3. Commit verified work.
4. Stop and report the current state.

## Important

Do not interpret reaching the end of a phase as a reason to stop.

Phases are organizational boundaries, not human approval checkpoints.

Continue into the next phase automatically when the previous phase is
verified complete.