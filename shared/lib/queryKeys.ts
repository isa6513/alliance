/**
 * Central registry of react-query keys
 */
export const queryKeys = {
  onetimeInvitesOverview: () => ["userGetOnetimeInvitesOverview"] as const,
  allianceMemberCount: () => ["userNmembers"] as const,
} as const;
