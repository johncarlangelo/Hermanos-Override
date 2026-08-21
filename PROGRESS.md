# Hermanos Override — Persistent Progress

## Purpose

This file is persistent agent memory for long-running or fresh-context coding sessions.

Update it whenever a meaningful task, phase, architectural decision, blocker, or verification result changes.

## Current State

- Current phase: Phase 0 — Repository Reconnaissance
- Current task: Inspect the repository before modifying it
- Status: Not started
- Last verification: Not run
- Last updated: 2026-08-21

## Completed Work

Nothing yet.

## Current Work

The agent should inspect the existing repository, understand the current technical setup, and identify what can be safely removed before beginning the clean rebuild.

## Known Issues / Blockers

None known.

## Verification History

No verification has been run yet.

## Important Notes

- Existing UI is disposable.
- MVP scope is defined in `PRD.md`.
- The product is Windows-only and single-user.
- Trainer files are manually managed.
- Do not introduce automatic trainer downloads or online services.
- Derived status must be calculated dynamically.
- User data belongs in the OS application-data directory, not the repository.

## Handoff Instructions

If context is compacted or a new agent/session starts:

1. Read `PRD.md`.
2. Read `TASKS.md`.
3. Read this file.
4. Read `VERIFY.md`.
5. Read `DECISIONS.md`.
6. Inspect the actual repository before assuming anything is implemented.
7. Continue from the first incomplete task.
