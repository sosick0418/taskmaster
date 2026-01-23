# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 16 App Router codebase. Core areas:
- `app/`: route segments, layouts, and `app/api` route handlers (see `(auth)` and `(dashboard)` groupings).
- `actions/`: server actions (task CRUD, auth flows).
- `components/`: UI by domain (`components/tasks`, `components/layout`, `components/shared`) and primitives in `components/ui`.
- `hooks/`, `lib/` (utilities, Prisma client, validations), `types/`, and `prisma/` (schema + migrations).
- Tests live in `__tests__/` (unit/integration) and `tests/` (Playwright E2E); static assets in `public/`.

## Build, Test, and Development Commands
- `npm run dev`: start the local dev server (Turbopack) at `http://localhost:3000`.
- `npm run build` / `npm run start`: production build and server.
- `npm run lint`: ESLint checks using Next.js + TypeScript rules.
- `npm run test` / `npm run test:run` / `npm run test:coverage`: Vitest (watch, single run, coverage).
- `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:headed`: Playwright E2E.
- `docker-compose up -d` and `npx prisma migrate dev`: start Postgres and apply migrations.

## Coding Style & Naming Conventions
- TypeScript + React; follow existing formatting (2-space indent, double quotes, no semicolons).
- Components use `PascalCase`, hooks use `useX`, and files match the component name.
- Tests use `*.test.ts` or `*.test.tsx`; keep related test files near their domain folders.
- Run `npm run lint` before pushing.

## Testing Guidelines
- Unit/integration tests: Vitest + Testing Library in `__tests__/` mirroring feature folders.
- E2E tests: Playwright in `tests/` grouped by feature (`auth/`, `tasks/`, `kanban/`).
- Aim to keep coverage near the current baseline (~90%+); validate with `npm run test:coverage`.

## Commit & Pull Request Guidelines
- Use conventional prefixes from history: `feat:`, `fix:`, `test:`, `tidy:`, optional scopes like `feat(tasks): ...`.
- Keep commits focused and PRs small; include a clear description, linked issues, and screenshots for UI changes.
- Note test results (unit and/or E2E) in the PR description when relevant.

## Configuration & Secrets
- Copy `.env.example` to `.env.local`; never commit secrets.
- Required values include `DATABASE_URL`, Auth.js credentials, and `NEXT_PUBLIC_APP_URL`.
