import { usePathname } from "expo-router";
import { useAuth } from "./AuthContext";
import { useMemo } from "react";

const BASE_PATHS = [
  "/",
  "/actions",
  "/information",
  "/search",
  "/notifications",
  "/feed",
  "/forum",
  "/invites",
  "/contract",
  "/profile",
  "/settings",
  "/groups",
  "/messages",
];

const BASE_ROUTE_NAMES = new Set([
  "index",
  "actions/index",
  "information",
  "search",
  "notifications",
  "feed",
  "forum/index",
  "invites",
  "contract",
  "profile",
  "settings",
  "groups/index",
  "messages/index",
]);

/** Check if a pathname is a base/root page (for sidebar gesture + animation). */
export function useIsBasePage(): boolean {
  const pathname = usePathname();
  const { user } = useAuth();

  return useMemo(() => {
    if (BASE_PATHS.includes(pathname)) return true;
    // Own profile page (/member/<id>) is also a base page
    if (user?.id !== undefined) {
      const match = pathname.match(/^\/member\/(\d+)$/);
      if (match && Number.parseInt(match[1], 10) === user.id) return true;
    }
    return false;
  }, [pathname, user?.id]);
}

/**
 * Check if a route name + params represent a base page.
 * Used by Stack screenOptions where we have the route object, not a pathname.
 */
export function isBaseRoute(
  name: string,
  params?: Record<string, any>,
  userId?: number,
): boolean {
  if (BASE_ROUTE_NAMES.has(name)) return true;
  if (userId !== undefined) {
    return (
      name === "member/[id]" && Number.parseInt(params?.id, 10) === userId
    );
  }
  return false;
}
