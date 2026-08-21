# Hermanos Override — Agent Working Contract

## Mission

Build Hermanos Override from the current repository into a polished, maintainable Windows desktop utility for managing locally owned trainers for single-player PC games.

The existing UI is disposable. Inspect the repository first, but do not preserve the old UI merely for compatibility.

## Operating Rules

1. Read `PRD.md`, `TASKS.md`, `PROGRESS.md`, `VERIFY.md`, and `DECISIONS.md` before making substantial changes.
2. Work from the current repository state, not from assumptions about previous iterations.
3. Do not ask the user for approval for ordinary implementation or design decisions.
4. Keep the MVP focused. Do not implement out-of-scope features.
5. Prefer simple, maintainable architecture and avoid unnecessary dependencies.
6. Use the available UI/UX capabilities to make independent design decisions.
7. After each meaningful task, verify the result.
8. Before declaring the MVP complete, run the full verification procedure in `VERIFY.md`.
9. Never claim something works merely because the code appears correct. Prefer executable tests, build checks, and actual application interaction.
10. If verification fails, diagnose the failure, fix it, and verify again.
11. If a task is incomplete, do not mark it complete.
12. Keep `TASKS.md` and `PROGRESS.md` synchronized with the actual repository state.
13. Record important architectural decisions in `DECISIONS.md`.
14. Do not silently weaken tests or verification criteria just to obtain a passing result.
15. Do not remove a verification requirement unless the requirement itself is explicitly changed in the product specification.

## Skills

Skills are an active and first-class part of the development workflow.

Before beginning any non-trivial task:

1. Inspect the skills actually discoverable by the current Antigravity workspace/session.

2. Inspect workspace-local skills under:
   `.agents/skills/`

3. Identify which available skills are relevant to the current task.

4. Use relevant skills when they provide specialized guidance, workflows, or capabilities.

5. Follow the instructions and constraints of any skill that is used.

6. Do not invoke unrelated skills merely for the sake of using them.

7. Do not invent, assume, or claim to have used skills that are not actually available
   or discoverable in the current session.

8. If a relevant skill is expected but not discoverable, document that limitation
   in `PROGRESS.md` rather than silently pretending the skill was used.

9. If no relevant skill exists, proceed using the project documentation and normal
   engineering practices.

During Phase 0, explicitly inspect and record the relevant discoverable skills
in `PROGRESS.md`. This establishes the skill environment for the rest of the
autonomous run.

Skills may be relevant for:

- UI/UX and visual design
- Electron development
- React/TypeScript development
- testing and verification
- accessibility
- architecture
- debugging
- documentation
- repository/project management

When a relevant skill exists, prefer using it rather than recreating specialized
guidance from scratch.

Workspace-local skills under `.agents/skills/` should be treated as
project-specific capabilities and should be considered during task planning.

## UI/UX Independence

The existing UI is disposable.

For UI/UX work, make independent design decisions based on the PRD, platform conventions, usability, accessibility, and the available UI/UX skills.

Do not ask the user to choose between ordinary visual design decisions such as:

* colors
* typography
* spacing
* layout
* component styling
* interaction patterns

unless the PRD leaves a product-critical decision genuinely ambiguous.

Prefer a coherent design system over isolated visual decisions.

The goal is to produce a polished, intentional interface rather than merely replacing the existing UI with a technically functional one.

## Subagent Delegation

Use specialized subagents when independent analysis, review, or verification would improve the result or reduce context usage.

Prefer delegation for:

* architecture investigation and review
* UI/UX review
* independent verification
* repository exploration that is not central to the current implementation
* focused debugging or analysis

Use the available project-level agents in `.agents/agents/` when they are appropriate to the task.

Do not delegate trivial tasks when doing so would add unnecessary overhead.

Treat subagent output as evidence, analysis, or recommendations rather than unquestionable truth.

The main agent remains responsible for integrating subagent findings and verifying the final implementation.

## Git and Commit Policy

Use Git as persistent project history and a recovery mechanism.

When a meaningful task or logical unit of work is completed and verified,
create a Git commit.

### Commit Granularity

Do not defer multiple completed phases into a single final commit.

A completed phase is a mandatory Git checkpoint.

Before proceeding from Phase N to Phase N+1:

1. Verify all completed tasks in Phase N.
2. Inspect the Git diff and confirm the changes belong to the completed phase.
3. Create one or more commits representing the meaningful logical units
   completed during that phase.
4. Confirm the committed changes are present in Git history.
5. Confirm the working tree is clean, unless intentionally uncommitted changes
   are explicitly documented.
6. Only then begin the next phase.

At minimum, each completed implementation phase should have its own commit when
that phase produces repository changes.

Do not create artificial commits merely to increase the number of commits.
Commit boundaries must represent meaningful, verified changes.

Do not accumulate multiple completed phases and commit them together.

### Conventional Commit Format

All commits MUST use a concise Conventional Commits one-line format:

`<type>: <short imperative description>`

Examples:

- `feat: add game library persistence`
- `feat: implement trainer process control`
- `feat: build game library interface`
- `feat: add executable path detection`
- `fix: handle missing trainer paths`
- `refactor: simplify IPC boundaries`
- `test: add persistence verification`
- `docs: update project progress`

Commit messages MUST:

- be exactly one line;
- use a valid Conventional Commits type;
- contain a concise imperative description;
- describe the actual change;
- avoid paragraphs, bullet points, bodies, or multi-line messages.

Do not create verbose commit messages.

Do not commit incomplete or unverified work.

Before committing, inspect the diff and ensure only the intended verified
changes are included.

Keep commits small and logically meaningful so individual changes can be
reverted or inspected independently.

### Publishing

When Git publishing is explicitly enabled for this project, push verified
commits to the configured remote after committing.

Do not rewrite published history unless explicitly required.

Pushing does not replace the requirement to maintain meaningful local commit
boundaries.

## Autonomous Loop Behavior

When operating inside an autonomous loop:

* Continue to the next unfinished task after successfully completing the current one.
* Re-read the relevant project files after context compaction or when unsure of state.
* Treat the filesystem, tests, and verification output as persistent memory.
* If the same failure occurs repeatedly, stop thrashing and document the blocker in `PROGRESS.md`.
* Never repeatedly make cosmetic changes without verifying whether they improve the stated requirement.
* Before final completion, perform a dedicated review pass for correctness, UX, accessibility, maintainability, and scope.

For each task:

1. Determine the current repository state.
2. Read the relevant project documentation.
3. Inspect available skills.
4. Identify and use applicable skills.
5. Determine whether a specialized subagent would improve the work.
6. Implement the task.
7. Run the task's required verification.
8. If verification fails, diagnose and fix the issue.
9. Re-run verification until the task passes or a genuine blocker is documented.
10. Update `TASKS.md` and `PROGRESS.md`.
11. Record significant architectural decisions in `DECISIONS.md`.
12. Only then proceed to the next unfinished task.

Do not use conversational momentum as evidence that a task is complete. Repository state and verification results are the source of truth.

## Permission Mode

This project may be operated in an autonomous permission-bypass mode.

When operating in this mode, do not interpret automatic permission approval
as approval to violate project scope, verification requirements, security
boundaries, or the instructions in this file.

Permission bypass only removes interactive approval prompts. It does not
remove the requirement to verify changes before considering them complete.

## Definition of Done

The project is not complete until:

* all MVP tasks in `TASKS.md` are complete;
* the full verification suite passes;
* the application builds cleanly;
* the complete happy-path workflow works;
* recovery workflows work;
* no known critical issues remain;
* the final implementation stays within MVP scope;
* the implementation has received a dedicated correctness, UX, accessibility, architecture, and maintainability review.

A verbal "looks done" is not a completion signal.

**Verification is the completion signal.**
