---
name: backend-add-use-case
description: Add a new endpoint / use-case to an EXISTING backend module (e.g. "add an endpoint to archive a banner", "add get-by-slug for products"). Covers DTO, use-case + interface, repository method, DI registration, controller method and route, following the project's clean architecture. Use whenever backend work adds or changes an API action.
---

# Add a use-case to an existing backend module

Work inside `backend/`. Reference implementation: `src/modules/banner/`. Read `backend/CLAUDE.md` first if it isn't loaded.

## 0. Understand before writing
1. Read the module's existing files: controller, its interface, routes, one similar use-case, the repository interface, `src/di/<module>.container.ts`.
2. Search for anything reusable: `src/core/utils/`, `src/core/shared/`, existing repository methods, existing `ResponseMessages`. Reuse instead of adding.
3. Decide the names now (`<action>` in lowercase words):
   - file `use-cases/<action>.<module>.use-case.ts`, class `<Action><Module>UseCase`, interface `I<Action><Module>UseCase`

## 1. DTO (only if the endpoint takes a body/query)
In `dtos/<module>.dto.ts` (or a new `dtos/<action>.<module>.dto.ts` if the module already splits them):
```ts
export const <Action><Module>Schema = z.object({ ... });
export type <Action><Module>RequestDto = z.infer<typeof <Action><Module>Schema>;
```
For list/search endpoints reuse `GetAllQuerySchema` + `parseReq` - don't write a new pagination schema.

## 2. Use-case interface
`use-cases/interfaces/<action>.<module>.use-case.interface.ts`:
```ts
export interface I<Action><Module>UseCase {
  execute(...): Promise<...>;
}
```

## 3. Repository (only if no existing method fits)
- Add the method signature to `repositories/<module>.repository.interface.ts` (domain types only - entities / View types, no mongoose types).
- Implement it in `repositories/<module>.repository.ts` using the Model + Mapper. Use `.lean()` for reads.

## 4. Use-case class
`use-cases/<action>.<module>.use-case.ts`:
- `@injectable()`, `implements I<Action><Module>UseCase`
- Inject only interfaces: `@inject("I<Module>Repository") private readonly _<module>Repository: I<Module>Repository`
- Business rules live here. Failures: `throw new CustomError(ResponseMessages.<KEY>, HttpStatusCode.<CODE>)`
- Entity changes go through entity methods that return a new instance.

## 5. Messages
Add any new message to the module's section in `src/core/constants/response.message.ts`. Never hardcode response strings.

## 6. DI registration
In `src/di/<module>.container.ts` add the import pair and:
```ts
container.register<I<Action><Module>UseCase>("I<Action><Module>UseCase", { useClass: <Action><Module>UseCase });
```

## 7. Controller
- Add the method signature to `controller/<module>.controller.interface.ts`.
- Inject the use-case in the controller constructor: `@inject("I<Action><Module>UseCase") private readonly _<action><Module>UseCase: I<Action><Module>UseCase`
- Method: `try { parse -> execute -> res.status(...).json({ success, message, data? }) } catch (error) { handleError(res, error); }`
- Validate `:id` params with `validateObjectId(id)`.

## 8. Route
In `routes/<module>.routes.ts`, follow the section comment style:
```ts
/* ---------- ADMIN: <ACTION> <MODULE> ---------- */
router.patch("/:id/<action>", authenticate.authenticate, authorizeRoles("admin"), (req, res) => controller.<method>(req, res));
```
Public routes simply omit the auth middleware. Place specific paths (`/list`, `/signature`) before `/:id`.

## 9. Verify
```bash
npm run lint
npm run build
```
Both must pass. Then tell the user the method + URL of the new endpoint and what body it expects.
