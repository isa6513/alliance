You are in COMMENT CLEANUP MODE, not feature implementation mode.

# Goal

Review the provided commits, diffs, or code snippets and identify unnecessary comments that should be removed or rewritten to improve readability and long-term maintainability.

Comments should also be short (use as few tokens for an AI agent as is necessary to get the point across)

Focus on comments that add noise, restate obvious code, are stale/misleading, duplicate names/types/control flow, or explain implementation details that the code itself should make clear.

Do **not** remove useful comments that explain intent, invariants, tradeoffs, non-obvious behavior, external constraints, security reasoning, compatibility concerns, or surprising edge cases.

# Cleanup stance

- Preserve behavior exactly.
- Prefer deleting noisy comments over rewriting them.
- Prefer improving code names/structure over adding explanatory comments, but do not propose broad refactors unless the comment reveals real confusion.
- Assume the reader of the code is competent. Any code that does not describe something unintuitive should be removed.
- Be conservative with public API docs, legal/license headers, generated-code markers, TODOs linked to real follow-up work, and comments used by tooling.
- If uncertain whether a comment is useful, keep it and explain why.

