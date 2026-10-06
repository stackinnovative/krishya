---
name: frontend-add-feature
description: Add or extend a frontend feature in frontend-next - API functions, React Query hooks, components, page and admin sidebar entry - reusing the existing admin-shell / storefront-shell components. Use for any new screen, list, form, or new backend endpoint the UI must consume.
---

# Add a frontend feature

Work inside `frontend-next/`. Reference: `src/modules/categories/` + `src/app/(admin)/admin/categories/page.tsx`. Read `frontend-next/CLAUDE.md` first if it isn't loaded.

## 0. Find what to reuse (do this first, every time)
1. List `src/modules/admin-shell/components/` (admin) or `src/modules/storefront-shell/components/` (storefront) and read the ones that fit: page shell, table, pagination, form modal, form field, image upload, status badge, async state.
2. Check `src/lib/` (format, errors, confirm, cloudinary, env) and `src/shared/` (query keys, API types, ui hooks).
3. If the feature belongs to an existing module in `src/modules/`, extend that module - don't create a parallel one.
4. Only create a new component when nothing existing fits. If an existing component *almost* fits, extend it with an optional prop instead of copying it.

## 1. Types - `src/modules/<feature>/types/<feature>.type.ts`
Request payloads and response data. Wrap responses with `ApiResponse<T>` / `GetAllDocResponse<T>` from `@/shared/types/api.types`. Match the backend's response fields exactly.

## 2. API - `src/modules/<feature>/api/<feature>.api.ts`
```ts
import api from "@/lib/api-client";
export const get<Thing>Api = async (...): Promise<<Response>> => {
  const response = await api.get<<Response>>("/<path>", { params });
  return response.data;
};
```
Paths are relative to the API base (no `/api/v1`). Never import axios.

## 3. Query keys - `src/shared/query-keys.ts`
Add a `<feature>Keys` object (or extend the existing one) with base keys `as const`. Never inline query keys.

## 4. Hooks - `src/modules/<feature>/hooks/use<Thing>.ts`
- Queries: `useQuery({ queryKey: [...<feature>Keys.x, params], queryFn, placeholderData: (prev) => prev })` for paginated lists.
- Mutations: `useMutation` + `toast.success(...)` + invalidate **every** key that shows this data (admin + storefront) + `onError: (err) => toast.error(getApiErrorMessage(err, "<fallback>"))`.

## 5. Components - `src/modules/<feature>/components/<Name>.tsx`
- Default export, PascalCase file name.
- Data comes from hooks - never call the API inside a component.
- Build with admin-shell / storefront-shell pieces; admin styling via `style-helpers.ts`, otherwise Tailwind.
- Use `<Image>` / `<Link>` from Next, `lucide-react` for icons.
- Handle loading / error / empty states (`AdminAsyncState`, `Skeleton`).

## 6. Page
- Admin: `src/app/(admin)/admin/<feature>/page.tsx` - `"use client"`, minimal state, wrap content in `AdminPageShell`. Add ONE entry to `ADMIN_NAV` in `src/modules/admin-shell/registry.ts`.
- Storefront: `src/app/(storefront)/<route>/page.tsx`.

## 7. Verify
```bash
npm run lint
npm run build
```
Both must pass. Then tell the user which URL to open to see the feature.
