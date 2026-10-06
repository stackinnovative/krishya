# Backend ESLint

Run `npm run lint` in `backend/`. Warnings fail the lint check.

The configuration uses the recommended ESLint and typescript-eslint rules,
with Node.js globals. Compiled output in `dist/` is excluded.

At the user's request, existing explicit `any` types are outside this cleanup's
scope, so `@typescript-eslint/no-explicit-any` is disabled. New code should still
use specific types, `unknown`, or generics as required by the root instructions.

Fix other lint findings in source; do not add disable comments or suppressions.
Run `npm run build` after lint to check TypeScript compilation.
