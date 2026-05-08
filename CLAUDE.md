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

## Dependencies

Dependencies in `apps/admin/package.json` must also be declared in `apps/frontend/package.json`. The workspace setup is non-standard. Use the same version range across packages and run `bun install` after editing.

## Memory

Do not write to the auto-memory system (`~/.claude/projects/.../memory/`). Persistent guidance belongs in a CLAUDE.md (root, `server/`, `apps/`) or under `.claude/skills/` so it's visible to everyone reading the repo and isn't a hidden rule. If a rule is worth remembering, add or edit one of those files instead — even if it means creating a new CLAUDE.md.
