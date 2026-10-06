---
name: backend-new-module
description: Create a brand-new backend module (a new resource such as "coupons", "reviews", "faq") with the full clean-architecture layout - schema, entity, mapper, repository, use-cases, controller, routes, DI container and registration in main.ts. Use when the requested feature needs a new MongoDB collection / API resource that no existing module owns.
---

# Create a new backend module

Work inside `backend/`. **Copy the shape of `src/modules/banner/` file by file** - it's the reference module. Read `backend/CLAUDE.md` first if it isn't loaded.

## 0. Confirm it's really a new module
Check `src/modules/` - if an existing module owns this data, extend it with the `backend-add-use-case` skill instead. If unsure, ask the user.

Pick names: `<module>` singular lowercase (folder + files), `<Module>` PascalCase, URL `/api/v1/<plural>`.

## 1. Create the files (in this order)

| # | File | Contents |
|---|---|---|
| 1 | `infrastructure/<module>.schema.ts` | `export interface I<Module> extends Document {...}`, `new Schema<I<Module>>({...}, { timestamps: true })`, `export const <Module>Model = model<I<Module>>(...)` |
| 2 | `types/<module>.type.ts` | `<Module>Props` (entity input), `<Module>View` / `User<Module>View` (response shapes) |
| 3 | `entities/<module>.entity.ts` | Class with `public readonly` fields, constructor validates invariants, methods return a **new** instance |
| 4 | `mappers/<module>.mapper.ts` | `static toDomain(...)`, `static toPersistence(entity)`, `static to<X>View(...)` - no `any`, type the input |
| 5 | `dtos/<module>.dto.ts` | Zod `Create<Module>Schema`, `Edit<Module>Schema` + `z.infer` types |
| 6 | `repositories/<module>.repository.interface.ts` | `I<Module>Repository` - domain types only |
| 7 | `repositories/<module>.repository.ts` | `@injectable() class <Module>Repository implements I<Module>Repository` - Model + Mapper, `.lean()` reads |
| 8 | `use-cases/interfaces/*.use-case.interface.ts` + `use-cases/*.use-case.ts` | One pair per action (create, edit, get, list, block/unblock, delete - only what was asked) |
| 9 | `controller/<module>.controller.interface.ts` + `controller/<module>.controller.ts` | Inject use-cases by interface; `try / Schema.parse / execute / res.json / catch handleError` |
| 10 | `routes/<module>.routes.ts` | `Router()`, resolve `Authenticate` + controller from the container, section comments per route |
| 11 | `<module>.module.ts` | `export default function register<Module>Module(app: Application) { app.use("/api/v1/<plural>", routes); }` |

## 2. Wire it up
1. `src/di/<module>.container.ts` - `export const register<Module>Dependencies = () => { container.register<I<Module>Repository>("I<Module>Repository", { useClass: <Module>Repository }); ... }` - one register per repository and use-case.
2. `src/di/container.ts` - import and call `register<Module>Dependencies()`.
3. `src/main.ts` - import and call `register<Module>Module(expressApp)` next to the others.
4. `src/core/constants/response.message.ts` - add a `/* ================= <MODULE> ================= */` section with the module's messages.

## 3. Rules
- Naming: interfaces `I...`, injected deps `_camelCase`, files dot-separated (`create.<module>.use-case.ts`).
- Use-cases, entities, DTOs and repository interfaces must not import mongoose/express (lint enforces this).
- Reuse `GetAllQuerySchema` + `parseReq` for list endpoints, `validateObjectId` for ids, ports in `src/core/ports/` for email/WhatsApp/payments.
- Only build the actions the user asked for.

## 4. Verify
```bash
npm run lint
npm run build
```
Then list the new endpoints (method + URL + auth) for the user. If the frontend needs it too, continue with the `frontend-add-feature` skill.
