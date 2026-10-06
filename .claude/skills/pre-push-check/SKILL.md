---
name: pre-push-check
description: Run the required quality gate (lint + build) for every project changed on the current branch before committing, pushing or saying a task is done. Use when finishing any code task, or when the user says "check", "ready to push", "is it done", or asks to commit.
---

# Pre-push check

## 1. Find what changed
```bash
git status --short
git diff --name-only main...HEAD
```
Note which of `backend/` and `frontend-next/` have changes (committed or not).

## 2. Safety checks
- No `.env` file is staged or changed: `git status --short | grep -E "\.env($|\.)" | grep -v example` must print nothing.
- No new `eslint-disable` comments in the diff: `git diff main -- '*.ts' '*.tsx' | grep "^+.*eslint-disable"` must print nothing (if it does, remove them and fix the real problem).
- `eslint-suppressions.json` may only **shrink**. If it grew, something hid new errors - undo that and fix them.
- No new dependency in any `package.json` unless the user approved it.
- On the developer's own branch: `git branch --show-current` must be `<name>-dev`, never `main`.
- Branch is up to date with `main`: `git fetch origin && git log HEAD..origin/main --oneline` should print nothing (if it does, run `git pull origin main` and re-check).
- Commits are small and focused: `git log origin/main..HEAD --oneline` - each commit is one logical change, and every message matches `type(module): description` with type in `feat|fix|refactor|chore|docs` and a 10-20 word description. Reword bad messages of unpushed commits before pushing (ask the user first).

## 3. Run the gates (only in changed projects)
```bash
cd backend && npm run lint && npm run build
cd frontend-next && npm run lint && npm run build
```

## 4. If something fails
Fix the cause in code. Never silence it (`eslint-disable`, `--suppress-all`, `any`, `@ts-ignore`, deleting the check). Re-run until both pass.

## 5. Report
Give the user a short result per project: lint ✅/❌, build ✅/❌, plus any safety-check finding. Only say the work is ready when everything passed.
