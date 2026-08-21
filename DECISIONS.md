# Hermanos Override — Architecture & Product Decisions

Record decisions here when implementation choices materially affect the project.

## Decision 001 — Clean UI Rebuild

The existing UI is not a design reference.

Reason:
The previous interface was not satisfactory and the product owner explicitly wants the agent to exercise independent UI/UX judgment.

## Decision 002 — Electron Architecture

Use Electron + React + TypeScript + Vite.

Reason:
This matches the current project direction and provides a practical path to a polished Windows desktop application.

## Decision 003 — Renderer/Main Boundary

Renderer code must not directly access privileged Node APIs.

Use preload + narrow IPC APIs for filesystem and process operations.

## Decision 004 — Local Persistence

Persist game records in the Windows application-data directory.

Reason:
User data should survive application restarts and should not depend on the repository location.

## Decision 005 — Derived Status

Do not persist game status as authoritative data.

Reason:
Filesystem and process state can change outside the application.

## Decision 006 — Manual Trainer Management

The user obtains trainer executables manually and links them locally.

Reason:
Automatic trainer downloads, APIs, and community systems are outside MVP scope.

## Decision 007 — Single Trainer Per Game

MVP supports one optional trainer executable per game.

Reason:
Multiple trainer/version management is explicitly out of scope.

## Decision 008 — No Game Launcher

Hermanos Override manages trainers only.

Reason:
Launching the actual game is outside MVP scope.

## Decision 009 — Verification Is the Completion Authority

Agent self-assessment is not sufficient for completion.

The repository's tests, build checks, application interaction checks, and verification gates determine whether a task is complete.

## Decision 010 — Fresh-Context-Friendly Workflow

Persistent project files are treated as external memory for long-running agent workflows.

Agents should be able to resume work after context compaction or a new session by reading the project state files and inspecting the repository.
