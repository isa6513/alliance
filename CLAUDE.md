## Packages

- `server/` — backend (NestJS)
- `apps/frontend/` — web (React)
- `apps/admin/` — admin panel (React)
- `apps/mobile/` — mobile (React Native)
- `sharedweb/` — shared by admin + frontend
- `shared/` — shared by admin + frontend + mobile
- `common/` — shared by all apps + server

## Typechecking

`bun run typecheck` works in any package (`server`, `apps/{frontend,admin,mobile}`, `sharedweb`, `shared`, `common`). **Never run `tsc` (or `tsc -b`) without `--noEmit`** — it emits `.d.ts` and `.js` files across the repo.

## Comments

Default to none. Add one only when the WHY isn't visible from the code — a hidden constraint, non-obvious invariant, workaround for a specific bug, surprising behavior. If removing it wouldn't confuse a future reader, skip it.

Don't write meta-commentary on changes you just made (`// updated to use new helper`, `// renamed from oldFn`, `// added per request`). That goes in the commit message — it's noise on read and rots on the next change.
