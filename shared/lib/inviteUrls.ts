/**
 * Build the signup URL for a onetime invite or referral code.
 * Used by mobile (share, QR), frontend (InviteMemberCard), and any client that needs the link.
 */
export function getOnetimeInviteSignupUrl(
  baseUrl: string,
  code: string,
): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/signup?ref=${code}`;
}

/** Alias for invite/referral signup URL; same as getOnetimeInviteSignupUrl. */
export const getReferralSignupUrl = getOnetimeInviteSignupUrl;
