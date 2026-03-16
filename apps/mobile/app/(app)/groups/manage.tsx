import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  communityGetMyCommunities,
  communityGetPublicCommunities,
  communityCreateCommunityAdmin,
} from "@alliance/shared/client";
import type {
  CommunityDto,
  CreateCommunityDto,
} from "@alliance/shared/client/types.gen";
import { getMemberCount } from "@alliance/shared/lib/communityUtils";
import { groupSettings } from "@alliance/shared/lib/copy";
import { GROUP_MAX_CAPACITY_DEFAULT } from "@alliance/shared/lib/constants";
import Text from "../../../components/system/Text";
import { colors } from "../../../lib/style/colors";
import { useAuth } from "../../../lib/AuthContext";

const sortByName = (a: CommunityDto, b: CommunityDto) =>
  a.name
    .trim()
    .localeCompare(b.name.trim(), undefined, { sensitivity: "base" });

const INITIAL_COMMUNITY: CreateCommunityDto = {
  name: "",
  description: "",
  photo: "",
  public: false,
  allowMemberInvites: true,
  allowStaffAssignments: true,
  maxCapacity: GROUP_MAX_CAPACITY_DEFAULT,
};

export default function GroupManageScreen() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [publicCommunities, setPublicCommunities] = useState<CommunityDto[]>(
    [],
  );
  const [publicCommunitiesError, setPublicCommunitiesError] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCommunity, setNewCommunity] =
    useState<CreateCommunityDto>(INITIAL_COMMUNITY);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const requiresMaxCapacity =
    newCommunity.public ||
    newCommunity.allowStaffAssignments ||
    newCommunity.allowMemberInvites;

  const { leaderCommunities, memberCommunities } = useMemo(() => {
    const leader = (communities ?? []).filter((c) =>
      c.leaders.some((l) => l.id === user?.id),
    );
    const member = (communities ?? []).filter(
      (c) => !c.leaders.some((l) => l.id === user?.id),
    );
    return {
      leaderCommunities: [...leader].sort(sortByName),
      memberCommunities: [...member].sort(sortByName),
    };
  }, [communities, user?.id]);

  const sortedPublicCommunities = useMemo(
    () => [...publicCommunities].sort(sortByName),
    [publicCommunities],
  );

  const loadCommunities = useCallback(async () => {
    try {
      const [myRes, publicRes] = await Promise.all([
        communityGetMyCommunities(),
        communityGetPublicCommunities(),
      ]);
      setCommunities(myRes.data ?? []);
      if (publicRes.data) {
        setPublicCommunities(publicRes.data);
        setPublicCommunitiesError(null);
      } else {
        setPublicCommunitiesError("Unable to load public groups.");
      }
    } catch (err) {
      console.error("Failed to load communities", err);
      setError("Unable to load communities. Please try again.");
      setPublicCommunitiesError("Unable to load public groups.");
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

  const handleCreateCommunity = useCallback(async () => {
    const name = newCommunity.name.trim();
    const description = newCommunity.description.trim();
    const photo = newCommunity.photo?.trim();

    let normalizedMaxCapacity: number | null = null;
    if (requiresMaxCapacity) {
      if (!newCommunity.maxCapacity || newCommunity.maxCapacity <= 0) {
        setError("Member capacity is required.");
        return;
      }
      normalizedMaxCapacity = newCommunity.maxCapacity;
    }

    if (!name || !description) {
      setError("Name and description are required.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const response = await communityCreateCommunityAdmin({
        body: {
          name,
          description,
          photo: photo || undefined,
          public: newCommunity.public,
          allowMemberInvites: newCommunity.allowMemberInvites,
          allowStaffAssignments: newCommunity.allowStaffAssignments,
          maxCapacity: normalizedMaxCapacity,
        },
      });
      if (response.data) {
        setNewCommunity(INITIAL_COMMUNITY);
        setShowCreateForm(false);
        void loadCommunities();
      }
    } catch (err) {
      console.error("Failed to create community", err);
      setError("Unable to create community. Please try again.");
    } finally {
      setCreating(false);
    }
  }, [newCommunity, requiresMaxCapacity, loadCommunities]);

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1">
          <View className="flex-row items-center gap-2 p-4">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <ArrowLeft size={24} color="#71717a" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-zinc-900 font-serif">
              Manage groups
            </Text>
          </View>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        </View>
      ) : (
        <>
          <View className="flex-row items-center gap-2 p-4 border-b border-zinc-200 bg-white">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <ArrowLeft size={24} color="#71717a" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-zinc-900 font-serif">
              Manage groups
            </Text>
            <View className="flex-1" />
            <TouchableOpacity
              onPress={() => {
                setShowCreateForm((v) => !v);
                setError(null);
              }}
              className="px-3 py-1.5 bg-zinc-900 rounded-lg"
            >
              <Text className="text-sm font-medium text-white">
                {showCreateForm ? "Cancel" : "+ New group"}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {error ? (
            <View className="mx-4 mb-3 p-3 bg-red-50 rounded-lg">
              <Text className="text-sm text-red-500">{error}</Text>
            </View>
          ) : null}

          {showCreateForm && (
            <View className="px-4 pb-4">
              <CreateGroupForm
                newCommunity={newCommunity}
                setNewCommunity={setNewCommunity}
                requiresMaxCapacity={requiresMaxCapacity}
                onCreate={handleCreateCommunity}
                creating={creating}
                error={error}
                setError={setError}
              />
            </View>
          )}

          {/* Groups you lead */}
          <View className="px-4 pt-2 pb-2">
            <Text className="text-xl font-semibold text-zinc-900">
              Groups you lead
            </Text>
            <Text className="text-base text-zinc-500 mt-0.5">
              You can lead as many groups as you want.
            </Text>
          </View>
          {leaderCommunities.length ? (
            leaderCommunities.map((community) => (
              <AdminCommunityCard key={community.id} community={community} />
            ))
          ) : (
            <View className="px-4 py-4">
              <Text className="text-sm text-zinc-500">
                You don&apos;t lead any groups yet.
              </Text>
            </View>
          )}

          {/* Groups you're a member of */}
          <View className="px-4 pt-6 pb-2">
            <Text className="text-xl font-semibold text-zinc-900">
              Groups you&apos;re a member of
            </Text>
            <Text className="text-base text-zinc-500 mt-0.5">
              For now, you can only be a member of one group.
            </Text>
          </View>
          {memberCommunities.length ? (
            memberCommunities.map((community) => (
              <AdminCommunityCard key={community.id} community={community} />
            ))
          ) : (
            <View className="px-4 py-4">
              <Text className="text-sm text-zinc-500">
                You are not a member of any group.
              </Text>
            </View>
          )}

          {/* Public groups */}
          <View className="px-4 pt-6 pb-2">
            <Text className="text-xl font-semibold text-zinc-900">
              Public groups
            </Text>
            <Text className="text-base text-zinc-500 mt-0.5">
              Groups you can join at any time.
            </Text>
          </View>
          {publicCommunitiesError ? (
            <View className="px-4 py-4">
              <Text className="text-sm text-red-500">
                {publicCommunitiesError}
              </Text>
            </View>
          ) : sortedPublicCommunities.length ? (
            sortedPublicCommunities.map((community) => (
              <AdminCommunityCard key={community.id} community={community} />
            ))
          ) : (
            <View className="px-4 py-4">
              <Text className="text-sm text-zinc-500">
                No public groups are available right now.
              </Text>
            </View>
          )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function AdminCommunityCard({ community }: { community: CommunityDto }) {
  const memberCount = getMemberCount(community);
  const leaderCount = community.leaders.length;
  const capacity = community.allowStaffAssignments
    ? community.maxCapacity
    : null;

  return (
    <View className="border-b border-zinc-100 px-4 py-4 gap-y-1">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-y-1">
          <Text className="font-semibold text-zinc-900">{community.name}</Text>
          <Text className="text-sm text-zinc-500" numberOfLines={2}>
            {community.description || "No description yet."}
          </Text>
        </View>
        <View className="items-end gap-y-1">
          <Text
            className={`text-xs font-medium ${community.public ? "text-green-600" : "text-zinc-400"}`}
          >
            {community.public ? "Public" : "Private"}
          </Text>
          <Text className="text-sm text-zinc-600">
            {memberCount}
            {capacity ? ` / ${capacity}` : ""} member
            {memberCount === 1 ? "" : "s"}
          </Text>
          {leaderCount > 0 && (
            <Text className="text-xs text-zinc-400">
              {leaderCount} leader{leaderCount === 1 ? "" : "s"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function CreateGroupForm({
  newCommunity,
  setNewCommunity,
  requiresMaxCapacity,
  onCreate,
  creating,
  error,
  setError,
}: {
  newCommunity: CreateCommunityDto;
  setNewCommunity: React.Dispatch<React.SetStateAction<CreateCommunityDto>>;
  requiresMaxCapacity: boolean;
  onCreate: () => void;
  creating: boolean;
  error: string | null;
  setError: (e: string | null) => void;
}) {
  return (
    <View className="mx-4 mb-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200 gap-y-4">
      <Text className="font-semibold text-zinc-900">Create group</Text>

      <View className="gap-y-1">
        <Text className="text-sm font-medium text-zinc-700">Name</Text>
        <TextInput
          className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white text-zinc-900"
          value={newCommunity.name}
          onChangeText={(text) => {
            setError(null);
            setNewCommunity((prev) => ({ ...prev, name: text }));
          }}
          placeholder="Member-visible title"
          placeholderTextColor="#a1a1aa"
        />
      </View>

      <View className="gap-y-1">
        <Text className="text-sm font-medium text-zinc-700">Description</Text>
        <TextInput
          className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white text-zinc-900 min-h-[72px]"
          value={newCommunity.description}
          onChangeText={(text) => {
            setError(null);
            setNewCommunity((prev) => ({ ...prev, description: text }));
          }}
          placeholder="What is this group for?"
          placeholderTextColor="#a1a1aa"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View className="gap-y-3 p-3 bg-white rounded-lg border border-zinc-200">
        <ToggleRow
          label={groupSettings.public.name}
          explanation={groupSettings.public.explanation}
          value={newCommunity.public}
          onValueChange={(checked) => {
            setError(null);
            setNewCommunity((prev) => ({
              ...prev,
              public: checked,
              allowMemberInvites: true,
              allowStaffAssignments: true,
            }));
          }}
        />
        <ToggleRow
          label={groupSettings.allowMemberInvites.name}
          explanation={groupSettings.allowMemberInvites.explanation}
          value={newCommunity.allowMemberInvites}
          onValueChange={(checked) => {
            setError(null);
            setNewCommunity((prev) => ({
              ...prev,
              allowMemberInvites: checked,
            }));
          }}
          disabled={newCommunity.public}
        />
        <ToggleRow
          label={groupSettings.allowStaffAssignments.name}
          explanation={groupSettings.allowStaffAssignments.explanation}
          value={newCommunity.allowStaffAssignments}
          onValueChange={(checked) => {
            setError(null);
            setNewCommunity((prev) => ({
              ...prev,
              allowStaffAssignments: checked,
            }));
          }}
          disabled={newCommunity.public}
        />

        {requiresMaxCapacity && (
          <View className="gap-y-1 pt-1 border-t border-zinc-100">
            <Text className="text-sm font-medium text-zinc-700">
              {groupSettings.maxCapacity.name}
            </Text>
            <Text className="text-xs text-zinc-500">
              {groupSettings.maxCapacity.explanation}
            </Text>
            <TextInput
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white text-zinc-900 mt-1"
              value={
                newCommunity.maxCapacity != null
                  ? String(newCommunity.maxCapacity)
                  : ""
              }
              onChangeText={(text) => {
                setError(null);
                const parsed = Number(text);
                setNewCommunity((prev) => ({
                  ...prev,
                  maxCapacity:
                    text === "" || Number.isNaN(parsed) ? null : parsed,
                }));
              }}
              keyboardType="number-pad"
              placeholderTextColor="#a1a1aa"
              placeholder="e.g. 20"
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={onCreate}
        disabled={creating}
        className={`py-3 rounded-lg items-center ${creating ? "bg-zinc-300" : "bg-zinc-900"}`}
      >
        <Text className="text-sm font-semibold text-white">
          {creating ? "Creating…" : "Create group"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ToggleRow({
  label,
  explanation,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  explanation: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text
          className={`text-sm font-medium ${disabled ? "text-zinc-400" : "text-zinc-900"}`}
        >
          {label}
        </Text>
        <Text className="text-xs text-zinc-500 mt-0.5">{explanation}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#e4e4e7", true: colors.green }}
        thumbColor="white"
      />
    </View>
  );
}
