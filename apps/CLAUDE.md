## API types

For server-derived types, import from the generated client at `shared/client/types.gen.ts` instead of redefining. Regenerate with `bun run gen-api` from the repo root.

Never edit `types.gen.ts` or `sdk.gen.ts` by hand — they regenerate from server endpoints. If they're stale, write code as if the types already exist (they'll appear on regen) rather than authoring manual stand-ins.
