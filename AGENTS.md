## Packages

- `server/` — backend (NestJS)
- `apps/frontend/` — web (React)
- `apps/admin/` — admin panel (React)
- `apps/mobile/` — mobile (React Native)
- `sharedweb/` — shared by admin + frontend
- `shared/` — shared by admin + frontend + mobile
- `common/` — shared by all apps + server

## Typechecking

**Always typecheck with `bun run typecheck`** — it works in any package (`server`, `apps/{frontend,admin,mobile}`, `sharedweb`, `shared`, `common`) and resolves the correct config (e.g. `tsconfig.typecheck.json`, which pulls shared sources in directly). Do **not** substitute a bare `tsc` invocation, even with `--noEmit`.

## Dependencies

Dependencies in `apps/admin/package.json` must also be declared in `apps/frontend/package.json`. The workspace setup is non-standard. Use the same version range across packages and run `bun install` after editing.

## Enum branching

Don't switch on an enum (or union discriminator) with a ternary or an open `if`/`else` chain — adding a new variant later won't trigger a typecheck error and the missing branch ships silently. Use one of:

- A `switch (kind)` with an exhaustive `default` that asserts `never`:

  ```ts
  switch (kind) {
    case MyEnum.A: ...; break;
    case MyEnum.B: ...; break;
    default:
      throw new Error(`unknown kind: ${kind satisfies never}`);
  }
  ```

  `satisfies never` is the load-bearing part — it makes any unhandled variant a compile error (because `kind` is no longer narrowed to `never` in `default`). The runtime throw is optional; if you'd rather silently drop unknown variants (e.g. so an older client doesn't crash when the server adds a new type), `default: kind satisfies never; return null;` (or similar) is fine — just keep the `satisfies never`.

- `const TABLE: Record<MyEnum, T> = { [MyEnum.A]: ..., [MyEnum.B]: ... }` and index in — `Record<MyEnum, T>` forces every variant to be listed.

Apply this to any branch keyed on a closed set (enum, string-literal union, tagged union `kind`), even when there are only two variants today.

## Result type

Prefer the `Result<T, E>` type in `common/` for operations that can fail in expected ways (parsing, validation, fallible I/O you want callers to handle explicitly) instead of throwing or returning `null`/`undefined`. Import it as both the type and the helper namespace: `import { Result } from "@alliance/common/result"`. Use the helpers (`Result.map`, `Result.flatMap`, `Result.match`, `Result.unwrapOr`, `Result.fromPromise`, `Result.fromThrowable`, etc.) rather than hand-rolling `{ ok, ... }` objects or re-implementing this pattern. Don't reach for it where throwing is already idiomatic (e.g. NestJS controllers that rely on exception filters) — it's for making expected failure explicit, not replacing every `throw`.

The full source (it's small):

@common/src/result.ts
