/**
 * Central registry of react-query keys
 */
export const queryKeys = {
  allianceMemberCount: () => ["userNmembers"] as const,
  myAwayRanges: () => ["userGetAwayRanges"] as const,
  onetimeInvitesOverview: () => ["userGetOnetimeInvitesOverview"] as const,
  publicCommunities: () => ["communityGetPublicCommunities"] as const,
} as const;
