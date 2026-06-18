/** Inline facepile cap; extra slots cover dropping the current user. */
export const LIKE_FACEPILE_LIMIT = 8;

/**
 * Deterministic per-target liker rank. Hashing avoids the same low-id users
 * leading every facepile while keeping refetches stable.
 */
export function likeOrderRank(targetId: number, userId: number): number {
  const str = `${targetId}:${userId}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Postgres twin of {@link likeOrderRank} for DB-side ordering and pagination. */
export const LIKE_ORDER_RANK_FN = "fnv1a_32";

/**
 * SQL twin of {@link likeOrderRank}, installed idempotently on boot. Keep FNV
 * constants, `"<targetId>:<userId>"` input, and unsigned 32-bit output in sync.
 */
export const LIKE_ORDER_RANK_FN_UP_SQL = `
  CREATE OR REPLACE FUNCTION ${LIKE_ORDER_RANK_FN}(input text)
  RETURNS bigint
  LANGUAGE plpgsql
  IMMUTABLE
  PARALLEL SAFE
  AS $$
  DECLARE
    h bigint := 2166136261; -- 0x811c9dc5 offset basis
    i int;
  BEGIN
    FOR i IN 1..length(input) LOOP
      h := h # ascii(substr(input, i, 1))::bigint; -- XOR byte
      h := (h * 16777619) % 4294967296;            -- * 0x01000193 mod 2^32
    END LOOP;
    RETURN h;
  END;
  $$;
`;

export const LIKE_ORDER_RANK_FN_DOWN_SQL = `DROP FUNCTION IF EXISTS ${LIKE_ORDER_RANK_FN}(text);`;

/** Orders by hash rank, breaking collisions by user id. */
export function byLikeOrder(
  targetId: number,
): (a: { id: number }, b: { id: number }) => number {
  return (a, b) =>
    likeOrderRank(targetId, a.id) - likeOrderRank(targetId, b.id) ||
    a.id - b.id;
}
