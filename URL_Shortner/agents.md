# URL Shortener — Codex Instructions

## Project

This repository contains the URL Shortener project.

Before making changes, understand the existing implementation and follow its established architecture and conventions.

Do not introduce a new architecture or refactor unrelated code unless explicitly requested.

---

## Project Documentation

The local `AI/` directory contains project-development documentation:

* `AI/Handover.md` — current project state
* `AI/Architecture.md` — system architecture
* `AI/Decisions.md` — important technical decisions and reasoning
* `AI/Constraints.md` — project boundaries and rules
* `AI/Flow.md` — execution and request flows
* `AI/TestChecklist.md` — testing and verification
* `AI/Rollback.md` — rollback information
* `AI/Bug.md` — important bug investigations

Read the relevant documentation before working on a task.

These files are living documents. They must remain synchronized with the actual codebase.

---

## Before Making Changes

For every non-trivial task:

1. Read the relevant `AI/` documentation.
2. Inspect the relevant source files.
3. Understand the existing execution flow.
4. Identify the smallest required change.
5. Identify affected files.
6. Explain the implementation plan before making significant changes.

Do not guess about existing behavior.

---

## Implementation Rules

When implementing an approved task:

* Make the smallest logical change.
* Preserve the existing architecture.
* Reuse existing services, middleware, validators, utilities, and error handling where appropriate.
* Do not modify unrelated files.
* Do not introduce unnecessary dependencies.
* Do not rewrite working code without a concrete reason.
* Do not change public API behavior without considering existing consumers.
* Do not make destructive database changes without explicit approval.

---

## Documentation Synchronization

Documentation updates are part of completing a task.

After modifying application code, determine whether the change affects:

### Handover.md

Update it whenever the project's current state changes.

### Architecture.md

Update it if architecture, module responsibilities, dependencies, database design, or major component interactions change.

### Decisions.md

Update it when a meaningful technical or architectural decision is introduced.

Record:

* decision
* reason
* alternatives
* tradeoffs

### Flow.md

Update it whenever an execution/request flow changes.

### TestChecklist.md

Update it with the actual tests and verification performed.

Never claim a test passed unless it was actually run.

### Bug.md

Update it for meaningful bug investigations or fixes.

### Rollback.md

Update it for significant or risky changes when the rollback procedure changes.

Do not merely tell the user that documentation should be updated.

Actually update the relevant files.

---

## Testing

After implementation:

1. Run relevant tests.
2. Run linting/static checks if configured.
3. Verify the affected functionality.
4. Test important failure cases.
5. Review the actual Git diff.

Report actual results.

Use:

PASS — actually verified

FAIL — actually failed

NOT VERIFIED — could not be tested

Never claim success without evidence.

---

## Diff Review

Before considering a task complete, inspect the actual Git diff.

Check:

* only intended files changed
* no unrelated refactoring
* no accidental API changes
* no accidental security changes
* no secrets were introduced
* no unnecessary dependencies were added
* documentation matches the resulting code

---

## Security

Never:

* expose secrets
* commit `.env` files
* log passwords or tokens
* bypass authentication
* bypass authorization
* weaken validation
* weaken cookie/token security for convenience

If a proposed change introduces a security tradeoff, stop and explain it before proceeding.

---

## Scope Control

One logical change per task.

Do not interpret broad requests as permission to rewrite the system.

If a large feature is requested, break it into logical phases and implement one approved phase at a time.

If you discover an unrelated bug, report it instead of silently fixing it.

---

## Completion Rule

A task is complete only when:

1. The requested code change is implemented.
2. Relevant tests/checks have been run.
3. The actual diff has been reviewed.
4. Relevant `AI/` documentation has been updated.
5. `AI/Handover.md` reflects the new project state.

The documentation update is part of the task, not an optional follow-up.

---

## Final Response

After completing a task, report:

### Changed

What was actually modified.

### Documentation

Which `AI/` files were updated and why.

### Tests

What was actually run and the result.

### Diff

Whether unrelated changes were found.

### Remaining

Anything that is not verified or still needs attention.
