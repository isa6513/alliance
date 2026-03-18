import { Community } from './entities/community.entity';

/**
 * Non-leader member count (users minus leaders). Safe when relations are unloaded.
 */
function getMemberCount(c: Community): number {
  return (c.users?.length ?? 0) - (c.leaders?.length ?? 0);
}

/**
 * Free slots in the community. Returns -1 when maxCapacity is null (unlimited/unknown).
 */
export function getCommunityFreeSlots(c: Community): number {
  if (c.maxCapacity === null) return -1;
  return c.maxCapacity - getMemberCount(c);
}

/**
 * True when the community has at least one free slot (maxCapacity not null and member count < maxCapacity).
 */
export function communityHasCapacity(c: Community): boolean {
  return getCommunityFreeSlots(c) > 0;
}

/**
 * True when the given user is a leader of the community. Safe when leaders relation is unloaded.
 */
export function isCommunityLedBy(
  c: Community,
  userId: number,
): boolean {
  return c.leaders?.some((leader) => leader.id === userId) ?? false;
}
