import {
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import {
  communityGetMyCommunities,
  communityGetCommunityInvites,
  userGetOnetimeInvitesByCommunity,
} from "@alliance/shared/client";
import { useQueryClient } from "@tanstack/react-query";
import type { CommunityDto } from "@alliance/shared/client/types.gen";
import { getMemberCount } from "@alliance/shared/lib/communityUtils";
import { getLeaderCommunityIds } from "@alliance/shared/lib/userUtils";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import { LegendList } from "@legendapp/list";
import Text from "../../../components/system/Text";
import { SimplePageTitle } from "../../../components/system/SimplePageTitle";
import { ScreenWithLoading } from "../../../components/system/ScreenWithLoading";
import { colors } from "../../../lib/style/colors";
import UserActivityCard from "../../../components/UserActivityCard";
import ProfileImage from "../../../components/ProfileImage";
import { useAuth } from "../../../lib/AuthContext";
import { cn } from "@alliance/shared/styles/util";

type Tab = "activity" | "members" | "invites";

const TAB_DISPLAY_NAMES: Record<Tab, string> = {
  activity: "Activity",
  members: "Members",
  invites: "Invites",
};

export default function GroupsScreen() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(
    null,
  );
  const [tab, setTab] = useState<Tab>("activity");

  const loadCommunities = useCallback(async () => {
    try {
      const response = await communityGetMyCommunities();
      const data = response.data ?? [];
      setCommunities(data);
      setSelectedCommunityId((prev) => {
        if (prev === null && data.length > 0) return data[0].id;
        if (data.some((c) => c.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (err) {
      console.error("Failed to load communities", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCommunities();
  }, [loadCommunities]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadCommunities();
  }, [loadCommunities]);

  const selectedCommunity = useMemo(
    () => communities.find((c) => c.id === selectedCommunityId) ?? null,
    [communities, selectedCommunityId],
  );

  const leaderCommunityIds = useMemo(
    () => getLeaderCommunityIds(user ?? undefined),
    [user],
  );
  const amLeader = useMemo(
    () =>
      selectedCommunity != null && leaderCommunityIds.has(selectedCommunity.id),
    [selectedCommunity, leaderCommunityIds],
  );

  const tabs: Tab[] = amLeader
    ? ["activity", "members", "invites"]
    : ["activity", "members"];

  if (loading) {
    return <ScreenWithLoading title="Groups" loading />;
  }

  if (communities.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <SimplePageTitle title="Groups">
          <TouchableOpacity
            onPress={() => router.push("/groups/manage")}
            className="p-2"
            accessibilityLabel="Manage groups"
          >
            <Settings size={22} color="#71717a" strokeWidth={2} />
          </TouchableOpacity>
        </SimplePageTitle>
        <View className="flex-1 px-4 py-8 items-center justify-center">
          <Text className="text-sm text-zinc-500 text-center">
            You are not in any groups yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/groups/manage")}
            className="mt-4 px-4 py-2 bg-zinc-900 rounded-lg"
          >
            <Text className="text-sm font-medium text-white">
              Manage groups
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SimplePageTitle title="Groups">
        <TouchableOpacity
          onPress={() => router.push("/groups/manage")}
          className="p-2"
          accessibilityLabel="Manage groups"
        >
          <Settings size={22} color="#71717a" strokeWidth={2} />
        </TouchableOpacity>
      </SimplePageTitle>

      <View className="px-4 my-4 flex flex-col gap-y-1">
        <Text className="text-xl font-medium text-zinc-900">
          {selectedCommunity?.name}
        </Text>
        <Text className="text-sm text-zinc-500">
          {selectedCommunity?.description}
        </Text>
      </View>

      {/* Tabs */}
      <View className="border-b border-zinc-200 px-2 flex-row gap-1">
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={cn(
              "px-3 py-3 border-b-2",
              t === tab ? "border-green" : "border-transparent",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                t === tab ? "text-green" : "text-zinc-500",
              )}
            >
              {TAB_DISPLAY_NAMES[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {selectedCommunity && (
        <View className="flex-1">
          {tab === "activity" && (
            <GroupActivityTab
              communityId={selectedCommunity.id}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
          )}
          {tab === "members" && (
            <GroupMembersTab community={selectedCommunity} />
          )}
          {tab === "invites" && amLeader && (
            <GroupInvitesTab
              communityId={selectedCommunity.id}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
          )}
        </View>
      )}
    </View>
  );
}

function GroupActivityTab({
  communityId,
  onRefresh,
  refreshing,
}: {
  communityId: number;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activities, handleLikeActivity, updateActivity, loading } =
    useActivities({
      list: ActivityList.Community,
      objectId: communityId,
      comments: true,
    });

  const handleRefresh = useCallback(() => {
    onRefresh();
    void queryClient.invalidateQueries({
      queryKey: [
        "useActivities",
        ActivityList.Community,
        communityId,
        50,
        true,
      ],
    });
  }, [onRefresh, queryClient, communityId]);

  if (loading && activities.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <LegendList
      data={activities}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View className="border-b-2 border-zinc-200">
          <UserActivityCard
            activity={item}
            handleLike={() => handleLikeActivity(item.id)}
            onActivityUpdate={updateActivity}
            canEdit={item.user.id === user?.id}
          />
        </View>
      )}
      ListEmptyComponent={
        <View className="py-12 items-center">
          <Text className="text-zinc-500">No activities yet</Text>
        </View>
      }
      recycleItems
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: "white" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
}

type MembersListItem =
  | { type: "header"; id: string; label: string }
  | {
      type: "member";
      id: number;
      profile: {
        id: number;
        displayName: string;
        profilePicture?: string | null;
      };
      isLeader: boolean;
    };

function GroupMembersTab({ community }: { community: CommunityDto }) {
  const leaders = community.leaders;
  const nonLeaderMembers = community.users.filter(
    (u) => !leaders.some((l) => l.id === u.id),
  );
  const memberCount = getMemberCount(community);

  const data = useMemo<MembersListItem[]>(() => {
    const items: MembersListItem[] = [];
    if (leaders.length > 0) {
      items.push({ type: "header", id: "leaders", label: "Leads" });
      for (const profile of leaders) {
        items.push({
          type: "member",
          id: profile.id,
          profile: {
            id: profile.id,
            displayName: profile.displayName,
            profilePicture: profile.profilePicture,
          },
          isLeader: true,
        });
      }
    }
    if (nonLeaderMembers.length > 0) {
      items.push({ type: "header", id: "members", label: "Members" });
      for (const profile of nonLeaderMembers) {
        items.push({
          type: "member",
          id: profile.id,
          profile: {
            id: profile.id,
            displayName: profile.displayName,
            profilePicture: profile.profilePicture,
          },
          isLeader: false,
        });
      }
    }
    return items;
  }, [leaders, nonLeaderMembers]);

  return (
    <LegendList
      data={data}
      keyExtractor={(item) =>
        item.type === "header" ? item.id : `member-${item.id}`
      }
      renderItem={({ item }) =>
        item.type === "header" ? (
          <View className="px-4 pb-2 pt-2 bg-white">
            <Text className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              {item.label}
            </Text>
          </View>
        ) : (
          <MemberRow profile={item.profile} isLeader={item.isLeader} />
        )
      }
      recycleItems
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: "white" }}
    />
  );
}

function MemberRow({
  profile,
  isLeader,
}: {
  profile: { id: number; displayName: string; profilePicture?: string | null };
  isLeader: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/member/${profile.id}`)}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-zinc-100"
    >
      <ProfileImage pfp={profile.profilePicture ?? null} size="large" />
      <View className="flex-1">
        <Text className="font-medium text-zinc-900" numberOfLines={1}>
          {profile.displayName}
        </Text>
        {isLeader && <Text className="text-xs text-zinc-500">Leader</Text>}
      </View>
    </TouchableOpacity>
  );
}

function GroupInvitesTab({
  communityId,
  onRefresh,
  refreshing,
}: {
  communityId: number;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [communityInvites, setCommunityInvites] = useState<
    Awaited<ReturnType<typeof communityGetCommunityInvites>>["data"]
  >([]);
  const [onetimeInvites, setOnetimeInvites] = useState<
    Awaited<ReturnType<typeof userGetOnetimeInvitesByCommunity>>["data"]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadInvites = useCallback(async () => {
    try {
      const [commRes, oneRes] = await Promise.all([
        communityGetCommunityInvites({ path: { communityId } }),
        userGetOnetimeInvitesByCommunity({ path: { communityId } }),
      ]);
      setCommunityInvites(commRes.data ?? []);
      setOnetimeInvites(oneRes.data ?? []);
    } catch (err) {
      console.error("Failed to load invites", err);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    void loadInvites();
  }, [loadInvites]);

  const handleRefresh = useCallback(() => {
    onRefresh();
    void loadInvites();
  }, [onRefresh, loadInvites]);

  const pendingCommunity = useMemo(
    () =>
      (communityInvites ?? []).filter((i) => i.status === "invitee_pending"),
    [communityInvites],
  );
  const pendingOnetime = useMemo(
    () =>
      (onetimeInvites ?? []).filter(
        (i) => i.status === "link_unused" || i.status === "request_pending",
      ),
    [onetimeInvites],
  );

  type InvitesListItem =
    | { type: "section"; id: string; label: string }
    | {
        type: "communityInvite";
        id: number;
        displayName: string;
      }
    | {
        type: "onetimeInvite";
        id: number;
        invitee: string | null;
        status: string;
      };

  const invitesData = useMemo<InvitesListItem[]>(() => {
    const items: InvitesListItem[] = [];
    if (pendingCommunity.length > 0) {
      items.push({
        type: "section",
        id: "community",
        label: "Current members invited",
      });
      for (const inv of pendingCommunity) {
        items.push({
          type: "communityInvite",
          id: inv.id,
          displayName: inv.invitedUser?.displayName ?? "Unknown",
        });
      }
    }
    if (pendingOnetime.length > 0) {
      for (const inv of pendingOnetime) {
        items.push({
          type: "onetimeInvite",
          id: inv.id,
          invitee: inv.invitee ?? null,
          status: inv.status,
        });
      }
    }
    return items;
  }, [pendingCommunity, pendingOnetime]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <LegendList
      data={invitesData}
      keyExtractor={(item) =>
        item.type === "section" ? item.id : `${item.type}-${item.id}`
      }
      renderItem={({ item }) =>
        item.type === "section" ? (
          <View className="px-4 pb-2 pt-2 bg-white">
            <Text className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              {item.label}
            </Text>
          </View>
        ) : item.type === "communityInvite" ? (
          <View className="py-2 px-4 border-b border-zinc-100 flex-row items-center justify-between bg-white">
            <Text className="text-zinc-900 font-medium">
              {item.displayName}
            </Text>
            <Text className="text-xs text-zinc-500">Pending</Text>
          </View>
        ) : (
          <View className="py-2 px-4 border-b border-zinc-100 flex-row items-center justify-between bg-white">
            <Text className="text-zinc-900 font-medium" numberOfLines={1}>
              {item.invitee ?? "Unnamed"}
            </Text>
            <Text className="text-xs text-zinc-500">
              {item.status === "request_pending" ? "Pending" : "Link sent"}
            </Text>
          </View>
        )
      }
      ListEmptyComponent={
        <View className="py-12 px-4 items-center">
          <Text className="text-zinc-500 text-center">
            No pending invites. Invite people from the web app or share a link.
          </Text>
        </View>
      }
      recycleItems
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: "white" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
}
