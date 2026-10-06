# Beeblu

E-commerce app. Two independent npm projects in one repo:

| Folder | Stack | Details |
|---|---|---|
| `backend/` | Express 5 + TypeScript (ESM), MongoDB/Mongoose, tsyringe DI, Zod | [backend/CLAUDE.md](backend/CLAUDE.md) |
| `frontend-next/` | Next.js 15 (App Router) + React 19, TanStack Query, Tailwind v4 | [frontend-next/CLAUDE.md](frontend-next/CLAUDE.md) |

Run npm commands inside the project folder, never at the repo root.

## Workflow

- **One branch per developer, named `<name>-dev`** (e.g. `hakeem-dev`). All of that developer's work goes there. **Never commit or push to `main`**, and never create extra feature branches.
- **Before starting work, sync with `main`**: `git checkout <name>-dev && git pull origin main`.
- **Small commits, one logical change each** (one endpoint, one component, one fix). Every commit must pass `npm run lint` and `npm run build` on its own. Never mix unrelated changes in one commit, and don't reformat files you didn't need to touch.
- **Commit message format: `type(module): description`** - description is **10 to 20 words**, lowercase, no trailing period, says what changed and why.
  - `type`: `feat` (new feature), `fix` (bug fix), `refactor` (no behavior change), `chore` (tooling, config, deps), `docs` (documentation only).
  - `module`: the backend module or frontend feature touched (`banner`, `order`, `products`, `admin-shell`...); for repo-wide changes use the area (`eslint`, `config`, `claude`).
  - Examples:
    - `feat(banner): add archive endpoint so admins can hide old banners without deleting their images`
    - `fix(order): await mongoose session end so payment failures are no longer silently swallowed`
    - `refactor(products): replace deep relative imports with the @ alias across wizard components`
- Changes reach `main` only through a PR from `<name>-dev` to `main`, reviewed and merged by the maintainer.
- **Never commit `.env` files or secrets.** New env variables go in that project's `.env.example` (with a placeholder value) and in its `src/config/env.ts` / `src/lib/env.ts`.
- **No new npm packages without explicit approval** from the user.
- Don't run `npm audit fix` - dependency updates are done separately by the maintainer.

## Before saying a task is done

Run in each project you changed:

```bash
npm run lint
npm run build
```

Both must pass. Use the `pre-push-check` skill. A PostToolUse hook already lints every file you edit and reports errors back - fix them immediately, don't move on.

## Code quality rules (both projects)

- **Follow the existing structure and patterns exactly.** Before writing a new file, open a similar existing file in the same project and copy its shape, naming and import style.
- **Reuse before creating.** Search for an existing component, hook, util, type or constant first. If something similar exists, use or extend it - never duplicate.
- **No `any`.** Use real types, `unknown`, or generics.
- **No hiding lint errors.** Never add `eslint-disable` comments, never edit `eslint-suppressions.json` by hand, never run `eslint --suppress-all`. If a rule seems wrong, stop and ask.
- If you fix old `any`s in a file you touched, run `npx eslint . --prune-suppressions` in `backend/` and commit the updated suppressions file.
- Lint rules per project: [backend/ESLINT.md](backend/ESLINT.md), [frontend-next/ESLINT.md](frontend-next/ESLINT.md).

## Skills for common tasks

| Task | Skill |
|---|---|
| Add an endpoint / use-case to an existing backend module | `backend-add-use-case` |
| Create a new backend module | `backend-new-module` |
| Add a frontend feature (API + hooks + components + page) | `frontend-add-feature` |
| Final check before pushing | `pre-push-check` |
| Review a developer branch / PR against these rules | `review-changes` |


## Design reference
UI must match the designs in /design. Read design/README.md first. The prototypes (Beeblu Prototype*.dc.html) are the source of truth. Build in frontend-next.
On mobile, build the floating icon tab bar (Home, Shop, Reels, Bag, You) as the main bottom navigation.
Do NOT build the small text pill "HOME · SHOP · PRODUCT · BLOG" at the bottom of the browser window. It is only a demo shortcut for the prototype.