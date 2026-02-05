export function getMemberCount(community: {
  users: unknown[];
  leaders: unknown[];
}) {
  return community.users.length - community.leaders.length;
}
