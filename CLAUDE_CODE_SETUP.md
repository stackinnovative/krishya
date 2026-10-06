# Claude Code Setup

How this repo keeps AI-written code consistent with our architecture, naming and reuse rules. Everything here is committed to git, so every developer who uses Claude Code in this repo gets it automatically.

## The 4 layers

| Layer | What it does | Strength |
|---|---|---|
| **1. Instructions** (`CLAUDE.md` files) | Tell Claude how we write code | Guidance - Claude usually follows it |
| **2. Skills** (`.claude/skills/`) | Step-by-step recipes for common tasks | Guidance, very specific |
| **3. Hook** (`.claude/settings.json`) | Lints every file right after Claude edits it | **Automatic, can't be skipped** |
| **4. Lint + build + PR review** | Final gate before merge | **Enforced** |

Instructions and skills make Claude write the right code. The hook and lint catch it when it doesn't. PR review catches what tools can't judge.

## Files

```
CLAUDE.md                              repo-wide rules (loaded in every session)
backend/CLAUDE.md                      backend architecture, patterns, reusable pieces
frontend-next/CLAUDE.md                frontend structure, patterns, reusable components
backend/ESLINT.md                      backend lint rules explained
frontend-next/ESLINT.md                frontend lint rules explained
.claude/settings.json                  registers the lint hook
.claude/hooks/lint-edited-file.mjs     the lint hook script
.claude/skills/<name>/SKILL.md         5 skills (below)
```

## 1. Instructions (`CLAUDE.md`)

### Root `CLAUDE.md` - every session
- One branch per developer (`<name>-dev`, e.g. `hakeem-dev`); never commit or push to `main`; no feature branches.
- Sync with `main` before starting work; small commits, one logical change each, each passing lint + build.
- Commit messages: `type(module): description` with a 10-20 word description.
- No unrelated refactors or reformatting.
- Never commit `.env`; new variables go in `.env.example`.
- No new npm packages without approval; no `npm audit fix`.
- Follow existing patterns; reuse before creating; no `any`.
- Never hide lint errors (`eslint-disable`, editing suppressions, `--suppress-all`).
- Must run `npm run lint` + `npm run build` before calling a task done.

### `backend/CLAUDE.md` - when working in `backend/`
- Request flow: routes -> controller -> use-case -> repository interface -> repository -> schema.
- What each layer may and may not do.
- Module folder layout and file naming (`create.banner.use-case.ts`, ...).
- Naming table: `I` interfaces, `_` private deps, DI tokens = interface names.
- Code templates for a controller method and a use-case.
- `ResponseMessages` / `HttpStatusCode` instead of hardcoded values.
- DI and module registration steps.
- **Reuse table**: `CustomError`/`handleError`, `GetAllQuerySchema`/`parseReq`, `validateObjectId`, auth helpers, Cloudinary delete, ports for email/WhatsApp/payment/invoice/hashing, auth middleware.
- Reference module: `src/modules/banner/`.

### `frontend-next/CLAUDE.md` - when working in `frontend-next/`
- Folder structure (`app/`, `modules/<feature>/{api,hooks,components,types}`, `shared/`, `lib/`).
- Templates for API functions and React Query hooks.
- Query keys only from `src/shared/query-keys.ts`; mutations invalidate admin + storefront views.
- **Reuse table**: `AdminPageShell`, `AdminTable`, `Pagination`, `FormModal`, `FormField`, `ImageDropzone`, `AdminAsyncState`, `StatusBadge`, `formatCurrency`, `confirmAction`, `env`, shared UI hooks, and more.
- New admin section = page + one entry in `admin-shell/registry.ts`.
- Naming table for components, hooks, API files, type files.
- Reference feature: `src/modules/categories/`.

## 2. Skills

Claude picks a skill automatically when the task matches its description. Developers can also call one directly, e.g. `/backend-add-use-case add an endpoint to archive a banner`.

| Skill | Use it when | What it makes Claude do |
|---|---|---|
| `backend-add-use-case` | Adding an endpoint to an existing backend module | Read the module first, then DTO -> use-case interface -> repository method -> use-case -> message constant -> DI registration -> controller -> route -> lint + build |
| `backend-new-module` | A new resource/collection (e.g. coupons, reviews) | Confirm no existing module owns it; create all 11 files by copying `banner/`; register in DI container and `main.ts`; add messages section |
| `frontend-add-feature` | Any new screen, list, form, or new API the UI uses | **Find reusable components first**; then types -> API -> query keys -> hooks -> components -> page -> sidebar entry -> lint + build |
| `pre-push-check` | Finishing a task / before commit or push | Check not on `main`, no `.env`, no new `eslint-disable`, suppressions didn't grow, no unapproved packages; run lint + build in changed projects |
| `review-changes` | Reviewing a PR or branch before merge | Run the gates, check architecture / reuse / naming / correctness / scope, report Must fix / Should fix with `file:line`, give Approve or Request changes |

## 3. Hook - lint after every edit

`.claude/settings.json` runs `.claude/hooks/lint-edited-file.mjs` after every `Write` / `Edit` Claude makes.

- Only for `.ts` / `.tsx` files inside `backend/` or `frontend-next/`.
- Uses that project's own ESLint config and suppressions file.
- If the file has errors, they are sent straight back to Claude with the instruction to fix them (and never to hide them). Claude fixes them before moving on.
- Clean file = silent, no slowdown beyond the lint itself (a few seconds in the backend).
- If `node_modules` isn't installed yet, it skips instead of blocking.

Developers can see or disable hooks with `/hooks` in Claude Code.

## How a developer uses this

### Branch model: one branch per developer

```
main            <- only the maintainer merges here (via PR)
 ├─ hakeem-dev  <- all of Hakeem's work, small commits
 └─ <name>-dev  <- one per developer
```

**First time:** `git checkout main && git pull && git checkout -b <name>-dev && git push -u origin <name>-dev`

**Every day:**
1. `git checkout <name>-dev && git pull origin main` - start from the latest `main`.
2. `npm install` in `backend/` and `frontend-next/` if packages changed.
3. Prompt Claude normally, e.g. *"Add a coupons module with admin CRUD."* The right skills and rules load automatically.
4. Commit in small steps, one logical change each. Message format: **`type(module): 10-20 word description`**, type = `feat|fix|refactor|chore|docs`. E.g.:
   - `feat(coupon): add coupon schema, entity and mapper with code, discount percentage and expiry date`
   - `feat(coupon): add admin create coupon endpoint with zod validation and duplicate code check`
5. Before pushing: `/pre-push-check`.
6. `git push`, then open (or update) the PR from `<name>-dev` to `main`. One open PR per developer; new pushes are added to it automatically.

**Maintainer:** review with `/review-changes hakeem-dev` (commit by commit), then merge.

**Merge setting:** on GitHub, use **"Create a merge commit"** (or "Rebase and merge"), **not "Squash and merge"**. Squashing rewrites the developer's commits, so the long-lived `<name>-dev` branch would conflict with `main` after every merge.

## Keeping it up to date

- **New pattern or rule agreed?** Update the relevant `CLAUDE.md` in the same PR that introduces it.
- **New reusable component or util?** Add it to the reuse table in that project's `CLAUDE.md`, otherwise Claude won't know it exists.
- **Lint rule change?** Update `eslint.config.mjs` and the matching `ESLINT.md` together.
- Keep `CLAUDE.md` files short and specific. They are loaded into every session, and long generic text gets ignored.

## Limits

- `CLAUDE.md` and skills are guidance. In long sessions Claude can still drift, which is why the hook, lint and PR review exist.
- Lint can't judge "is this the right place" or "did you reuse the existing component". That's what `review-changes` and human review are for.
- The hook checks one file at a time. Cross-file problems (a broken import elsewhere) are caught by `npm run build`.
