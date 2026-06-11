You are in COMMENT CLEANUP MODE, not feature implementation mode.

# Goal

Review the provided commits, diffs, or code snippets and identify unnecessary comments that should be removed or rewritten to improve readability and long-term maintainability.

Comments should also be short (use as few tokens for an AI agent as is necessary to get the point across)

# Tighten wording

For every comment you keep, cut words that carry no meaning while preserving clarity and avoiding ambiguity. Drop unnecessary articles ("the", "a"), filler prepositions, and hedges ("one that", "is used to", "in order to"); prefer the shorter phrasing when it reads as clearly. Examples:

- "A 'terminal' activity is one that determines a user's status" → "A 'terminal' activity determines a user's status"
- "rescanning the full list for every action" → "rescanning per action"
- "or `null` if they have neither" → "or `null` if neither exists"
- "completing an action you previously dismissed" → "completing a previously dismissed action"

Stop when further cuts would lose meaning or create ambiguity — terseness must not cost the reader a second pass.

Focus on comments that add noise, restate obvious code, are stale/misleading, duplicate names/types/control flow, or explain implementation details that the code itself should make clear.

Do **not** remove useful comments that explain intent, invariants, tradeoffs, non-obvious behavior, external constraints, security reasoning, compatibility concerns, or surprising edge cases.

# Check comment correctness

Every comment you keep must be _true of the current code_. Read the code it describes and verify the claim still holds — names, types, control flow, return values, conditions, and any cross-references (`{@link ...}`, file paths, function names) it mentions. Flag comments that are stale, misleading, or describe behavior the code no longer has. Prefer fixing an incorrect-but-useful comment to match reality over deleting it; delete it only if the underlying point is no longer worth making.

# Prefer doc comments for declarations

When a comment documents a declaration — a function, class, method, type, interface, enum, exported constant, or field — prefer a JSDoc/TSDoc block (`/** ... */`) over a line comment (`//`) so the IDE surfaces it on hover and at call sites. Convert an existing `//` comment that sits directly above such a declaration into a `/** */` block.

Keep `//` for comments _inside_ a function body (explaining a statement, branch, or expression) — those aren't attached to a symbol and gain nothing from `/** */`.

# Cleanup stance

- Preserve behavior exactly.
- Prefer deleting noisy comments over rewriting them.
- Prefer improving code names/structure over adding explanatory comments, but do not propose broad refactors unless the comment reveals real confusion.
- Assume the reader of the code is competent. Any code that does not describe something unintuitive should be removed.
- Be conservative with public API docs, legal/license headers, generated-code markers, TODOs linked to real follow-up work, and comments used by tooling.
- If uncertain whether a comment is useful, keep it and explain why.
