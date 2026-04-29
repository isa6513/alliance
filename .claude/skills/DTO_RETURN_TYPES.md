# Endpoint Return Types

Controller return types must be a single DTO class — or `Promise<void>` for no-content endpoints. No primitives, no `T | null`.

```ts
// ✅
async getThing(): Promise<ThingDto> { ... }
async deleteThing(): Promise<void> { ... }

// ❌
async isEligible(): Promise<boolean> { ... }
async getThing(): Promise<ThingDto | null> { ... }
async getCount(): Promise<number | null> { ... }
```

To return a primitive or optional value, **wrap it in a DTO**. The DTO's _fields_ can be optional or `| null` — the restriction only applies at the endpoint boundary.

```ts
class IsEligibleDto {
  @ApiProperty()
  eligible: boolean;

  @ApiPropertyOptional()
  reason?: string;
}
async isEligible(): Promise<IsEligibleDto> { ... }
```

## Resource may not exist

**Throw `NotFoundException`** when absence is exceptional:

```ts
async getGuestFormResponse(...): Promise<FormResponseDto> {
  const response = await this.repo.findOne({ ... });
  if (!response) throw new NotFoundException('Guest form response not found');
  return response;
}
```

**Wrapper DTO** when absence is a normal state the caller branches on:

```ts
class MaybeFormResponseDto {
  @ApiPropertyOptional({ type: () => FormResponseDto })
  response?: FormResponseDto;
}
```

## Why

NestJS serializes a `null` return as a **200 with empty body** (not JSON `null`). The hey-api fetch client parses the empty body as `{}`, which is truthy and passes `value ?? fallback` — callers expecting `null` get a malformed empty DTO and crash downstream.

## After editing

Run `bun run gen-api` at the repo root, then update callsites. Never hand-edit generated files.
