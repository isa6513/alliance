/**
 * Build the signup URL for a onetime invite. Used by mobile (share) and any client that needs the link.
 */
export function getOnetimeInviteSignupUrl(baseUrl: string, code: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/signup?ref=${code}`;
}
