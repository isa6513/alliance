import { useQuery } from "@tanstack/react-query";
import { userNmembers } from "../client";
import { queryKeys } from "./queryKeys";

export function useAllianceMemberCount(params?: { enabled?: boolean }) {
  const { enabled = true } = params ?? {};
  return useQuery({
    queryKey: queryKeys.allianceMemberCount(),
    queryFn: () => userNmembers().then((res) => res.data?.count ?? 0),
    enabled,
  });
}
