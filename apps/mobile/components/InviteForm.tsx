import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Alert, TouchableOpacity, ScrollView } from "react-native";
import { ChevronDown } from "lucide-react-native";
import type { CommunityDto, OnetimeInviteDto } from "@alliance/shared/client";
import {
  communityCreateCommunity,
  communityGetMyCommunities,
} from "@alliance/shared/client";
import { GROUP_MAX_CAPACITY_DEFAULT } from "@alliance/shared/lib/constants";
import { onetimeInviteCreation } from "@alliance/shared/lib/copy";
import { getLeaderCommunityIds } from "@alliance/shared/lib/userUtils";
import Card, { CardStyle } from "./system/Card";
import Button, { ButtonColor } from "./system/Button";
import Input from "./system/Input";
import Text from "./system/Text";
import AppMarkdownWrapper from "./AppMarkdownWrapper";
import FormModal from "./forms/FormModal";
import { colors } from "../lib/style/colors";
import { useAuth } from "../lib/AuthContext";
import { useCreateOnetimeInvite } from "../lib/useCreateOnetimeInvite";

type InviteFormProps = {
  onInviteCreated: (invite: OnetimeInviteDto) => void;
};

export default function InviteForm({ onInviteCreated }: InviteFormProps) {
  const { user } = useAuth();
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(
    null,
  );
  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupSelectModalOpen, setGroupSelectModalOpen] = useState(false);

  const leaderCommunityIds = useMemo(
    () => getLeaderCommunityIds(user ?? undefined),
    [user],
  );

  const {
    inviteeName,
    setInviteeName,
    info,
    setInfo,
    responsibilityChoice,
    setResponsibilityChoice,
    creatingInvite,
    createInvite,
  } = useCreateOnetimeInvite({
    onInviteCreated,
    onError: (message) => Alert.alert("Error", message),
  });

  const refreshCommunities = useCallback(async () => {
    const response = await communityGetMyCommunities();
    if (response.data) {
      setCommunities(response.data);
      const firstLeaderId = response.data.find((c) =>
        leaderCommunityIds.has(c.id),
      )?.id;
      setSelectedCommunityId(firstLeaderId ?? null);
    }
  }, [leaderCommunityIds]);

  useEffect(() => {
    void refreshCommunities();
  }, [refreshCommunities]);

  useEffect(() => {
    if (
      selectedCommunityId === null &&
      communities.length > 0 &&
      leaderCommunityIds.size > 0
    ) {
      const first = communities.find((c) => leaderCommunityIds.has(c.id));
      if (first) setSelectedCommunityId(first.id);
    }
  }, [communities, leaderCommunityIds, selectedCommunityId]);

  const leaderCommunities = useMemo(
    () => communities.filter((c) => leaderCommunityIds.has(c.id)),
    [communities, leaderCommunityIds],
  );

  const selectedCommunity = useMemo(
    () => leaderCommunities.find((c) => c.id === selectedCommunityId) ?? null,
    [leaderCommunities, selectedCommunityId],
  );

  const groupSelectLabel = useMemo(() => {
    if (showCreateGroupForm) return "Create a new group";
    if (selectedCommunity) return selectedCommunity.name;
    return "Select a group";
  }, [showCreateGroupForm, selectedCommunity]);

  const handleCreateGroup = useCallback(async () => {
    const name = newGroupName.trim();
    if (!name) {
      Alert.alert("Missing name", "Please enter a group name.");
      return;
    }
    setCreatingGroup(true);
    try {
      const response = await communityCreateCommunity({
        body: {
          name,
          description: newGroupDescription.trim() || "",
          public: false,
          allowMemberInvites: true,
          allowStaffAssignments: true,
          maxCapacity: GROUP_MAX_CAPACITY_DEFAULT,
        },
      });
      if (response.data) {
        const community = response.data;
        setNewGroupName("");
        setNewGroupDescription("");
        setShowCreateGroupForm(false);
        await refreshCommunities();
        setSelectedCommunityId(community.id);
        if (inviteeName.trim()) {
          await createInvite(community.id);
        }
      } else {
        Alert.alert(
          "Error",
          response.response?.statusText ?? "Failed to create group.",
        );
      }
    } catch {
      Alert.alert("Error", "Failed to create group.");
    } finally {
      setCreatingGroup(false);
    }
  }, [
    newGroupName,
    newGroupDescription,
    inviteeName,
    refreshCommunities,
    createInvite,
  ]);

  const isLeader = leaderCommunities.length > 0;

  return (
    <Card cardStyle={CardStyle.Grey} className="rounded-xl">
      <View className="gap-4">
        <View>
          <Text className="text-lg font-semibold text-zinc-900">
            {onetimeInviteCreation.title}
          </Text>
          <View className="mt-1">
            <AppMarkdownWrapper>
              {onetimeInviteCreation.explanation.join("\n\n")}
            </AppMarkdownWrapper>
          </View>
        </View>

        <View className="flex-row gap-2">
          <Button
            onPress={() => setResponsibilityChoice("responsible")}
            color={
              responsibilityChoice === "responsible"
                ? ButtonColor.Green
                : ButtonColor.Outline
            }
            title={onetimeInviteCreation.responsible.buttonText}
            className="flex-1"
          />
          <Button
            onPress={() => setResponsibilityChoice("not_responsible")}
            color={
              responsibilityChoice === "not_responsible"
                ? ButtonColor.Green
                : ButtonColor.Outline
            }
            title={onetimeInviteCreation.not_responsible.buttonText}
            className="flex-1"
          />
        </View>

        {responsibilityChoice === "not_responsible" && (
          <View className="gap-3 pt-2 border-t border-zinc-200">
            <Text className="text-base font-semibold text-zinc-700">
              {onetimeInviteCreation.not_responsible.title}
            </Text>
            <Input
              label="Invitee's first name"
              placeholder="Enter name"
              value={inviteeName}
              onChangeText={setInviteeName}
              containerClassName="gap-0"
            />
            <Input
              label="Context for the office (optional)"
              placeholder="e.g. how you know them, how you'll send the invite"
              value={info}
              onChangeText={setInfo}
              multiline
              numberOfLines={2}
              containerClassName="gap-0"
            />
            <Button
              onPress={() => createInvite(null)}
              color={ButtonColor.Black}
              title={creatingInvite ? "Creating…" : "Create invite"}
              disabled={creatingInvite || !inviteeName.trim()}
              loading={creatingInvite}
            />
          </View>
        )}

        {responsibilityChoice === "responsible" && (
          <View className="gap-3 pt-2 border-t border-zinc-200">
            <View className="gap-3">
              <Text className="text-base font-semibold text-zinc-700">
                {onetimeInviteCreation.responsible.leader.invite.title}
              </Text>
              <View>
                <AppMarkdownWrapper>
                  {onetimeInviteCreation.responsible.leader.invite.explanation.join(
                    "\n\n",
                  )}
                </AppMarkdownWrapper>
              </View>
              <Input
                label="Invitee's first name"
                placeholder="Enter name"
                value={inviteeName}
                onChangeText={setInviteeName}
                containerClassName="gap-0"
              />
              <Input
                label="Context for the office (optional)"
                placeholder="Optional"
                value={info}
                onChangeText={setInfo}
                multiline
                numberOfLines={2}
                containerClassName="gap-0"
              />
            </View>

            {isLeader ? (
              <View className="gap-3 pt-2 border-t border-zinc-200">
                <Text className="text-base font-semibold text-zinc-700">
                  {onetimeInviteCreation.responsible.leader.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setGroupSelectModalOpen(true)}
                  activeOpacity={0.85}
                  className="w-full rounded-lg border border-zinc-200 bg-white flex-row items-center justify-between px-3 py-3"
                >
                  <Text
                    className="text-base text-zinc-900 flex-1"
                    numberOfLines={1}
                  >
                    {groupSelectLabel}
                  </Text>
                  <ChevronDown size={18} color={colors.text.icon} />
                </TouchableOpacity>

                <FormModal
                  visible={groupSelectModalOpen}
                  onClose={() => setGroupSelectModalOpen(false)}
                  maxHeight={400}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-semibold text-zinc-900">
                      {onetimeInviteCreation.responsible.leader.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setGroupSelectModalOpen(false)}
                    >
                      <Text className="text-blue-600 font-medium">Close</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView className="max-h-72">
                    <View className="gap-0">
                      {leaderCommunities.map((community) => (
                        <TouchableOpacity
                          key={community.id}
                          onPress={() => {
                            setShowCreateGroupForm(false);
                            setSelectedCommunityId(community.id);
                            setGroupSelectModalOpen(false);
                          }}
                          className="py-3 border-b border-zinc-100"
                          activeOpacity={0.7}
                        >
                          <Text className="text-base text-zinc-900">
                            {community.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedCommunityId(null);
                          setShowCreateGroupForm(true);
                          setGroupSelectModalOpen(false);
                        }}
                        className="py-3"
                        activeOpacity={0.7}
                      >
                        <Text className="text-base text-zinc-900">
                          Create new group
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </FormModal>

                {showCreateGroupForm && (
                  <View className="gap-3 pt-2 border-t border-zinc-200">
                    <Text className="text-base font-semibold text-zinc-700">
                      {onetimeInviteCreation.responsible.leader.newGroup.title}
                    </Text>
                    <Input
                      label="Group name"
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChangeText={setNewGroupName}
                      containerClassName="gap-0"
                    />
                    <Input
                      label="Description (optional)"
                      placeholder="Enter group description"
                      value={newGroupDescription}
                      onChangeText={setNewGroupDescription}
                      multiline
                      numberOfLines={2}
                      containerClassName="gap-0"
                    />
                    <Button
                      onPress={() => handleCreateGroup()}
                      color={ButtonColor.Black}
                      title={
                        creatingGroup
                          ? "Creating…"
                          : onetimeInviteCreation.responsible.leader.newGroup
                              .createButtonText
                      }
                      disabled={creatingGroup || !newGroupName.trim()}
                      loading={creatingGroup}
                    />
                  </View>
                )}

                {selectedCommunityId !== null && !showCreateGroupForm && (
                  <Button
                    onPress={() => createInvite(selectedCommunityId ?? null)}
                    color={ButtonColor.Black}
                    title={creatingInvite ? "Creating…" : "Create invite"}
                    disabled={
                      creatingInvite ||
                      !inviteeName.trim() ||
                      selectedCommunityId === null
                    }
                    loading={creatingInvite}
                  />
                )}
              </View>
            ) : (
              <Text className="text-sm text-zinc-500">
                You don&apos;t lead a group yet. Create a group on the web app
                first, or choose &quot;Someone else&quot; to create an invite
                without a group.
              </Text>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}
