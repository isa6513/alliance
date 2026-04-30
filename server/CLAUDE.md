## Endpoints

Every controller endpoint needs `@ApiOkResponse({ type: })` (or `@ApiResponse`) matching its return type (omit `type` for void).

**Before adding or editing an endpoint's return type or existing DTO, read `.claude/skills/DTO_RETURN_TYPES.md`.** Controller return types must be a DTO class — never a primitive, never `DtoType | null`. Wrap primitives in a DTO; for "not found" use `NotFoundException` or a wrapper DTO.

DTOs: use mapped types over entities, e.g. `SampleDto extends OmitType(SampleEntity, ['sample']) {}`. Mark optional (`?`) fields with `@ApiPropertyOptional`, not `nullable`.

New endpoints need `@AuthGuard`, `@AdminGuard`, or `@CommunityLeaderGuard` depending on access level.

## Service methods

Prefer fetch-then-compute: do all DB reads up top, then run pure logic on the fetched data. Keeps the IO surface visible and the logic easy to test.

Sometimes you can't cleanly split — e.g. a later fetch depends on a value derived from earlier reads, or a fetch is conditional. Do your best; partial separation still beats fully interleaved IO and logic.

Existing methods often don't follow this. Don't refactor just to fix shape, but if you're already editing one, move it toward this structure.

## Tests

`npm run test:agents` — end-to-end tests against a custom postgres.

## Migrations

**Before generating or writing a db migration, read `.claude/skills/MIGRATIONS.md`.**
