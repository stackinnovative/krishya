---
name: review-changes
description: Review a developer branch (e.g. hakeem-dev) or pull request against Beeblu's architecture, naming, reuse and quality rules before it is merged. Use when the user asks to review a PR, a developer's branch, the intern's changes, or "check this before I merge".
---

# Review changes against project rules

Goal: a reviewer-style report on whether the change follows the project's rules. Don't edit code unless the user asks.

## 1. Get the changes
Each developer works on one long-lived branch named `<name>-dev`; only commits not yet in `main` need review.
```bash
git fetch origin
git log --oneline origin/main..origin/<name>-dev        # commits to review
git diff origin/main...origin/<name>-dev                # combined change
```
- PR number given: `gh pr view <n>` to find the branch, then use the commands above.
- Review **commit by commit** (`git show <sha>`) as well as the combined diff. Read every changed file in full, not just the hunks.

## 2. Run the gates
Run the `pre-push-check` skill steps (lint + build + safety checks) for the changed projects.

## 3. Check against the rules
Use `backend/CLAUDE.md`, `frontend-next/CLAUDE.md` and both `ESLINT.md` files as the source of truth.

**Architecture**
- Backend: logic in use-cases; controllers only parse + call one use-case + respond; repositories are the only DB access; inner layers free of mongoose/express; new classes registered in `src/di/`.
- Frontend: API calls in `api/`, server state via hooks in `hooks/`, query keys from `src/shared/query-keys.ts`, mutations invalidate all affected views.

**Reuse**
- Any new component, hook, util, type or constant that duplicates or nearly duplicates an existing one (search for similar names and logic). Name the existing thing it should have used.
- Hardcoded messages / status codes instead of `ResponseMessages` / `HttpStatusCode`.

**Naming & style**
- File naming per project conventions; interfaces `I...`; private deps `_...`; consistent with neighbouring files.

**Correctness**
- Missing validation (Zod schema, `validateObjectId`), missing auth middleware on admin routes, unhandled errors, missing loading/error states in UI, stale data (missing invalidation).

**Scope & hygiene**
- Unrelated changes, leftover debug code, commented-out code, new packages, `.env` changes, new `eslint-disable`, grown `eslint-suppressions.json`.

**Commits**
- Each commit is small and does one logical thing.
- Every message follows `type(module): description` - type in `feat|fix|refactor|chore|docs`, module = the module/feature touched, description 10-20 words saying what and why.
- Flag commits that mix unrelated changes, break the format, have vague descriptions ("update", "changes", "fix bug"), or break the build on their own.
- Branch is up to date with `main` (no conflicts).

## 4. Report
Group findings as **Must fix** (rule violations, bugs) / **Should fix** (reuse, clarity) / **Nice to have**. Each finding: `file:line`, what's wrong, what to do instead (point to the existing code to reuse). End with a clear verdict: **Approve** or **Request changes**.
