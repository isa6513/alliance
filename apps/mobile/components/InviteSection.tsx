import React from "react";
import { View } from "react-native";
import type { OnetimeInviteDto } from "@alliance/shared/client";
import type { OnetimeInviteActions } from "@alliance/shared/lib/inviteUtils";
import Text from "./system/Text";
import OnetimeInviteListItem from "./OnetimeInviteListItem";

export type InviteSectionProps = {
  title: string;
  description?: string;
  invites: OnetimeInviteDto[];
  user: { id: number };
  sharedInviteId: number | null;
  actions: OnetimeInviteActions;
};

export function InviteSection({
  title,
  description,
  invites,
  user,
  sharedInviteId,
  actions,
}: InviteSectionProps) {
  if (invites.length === 0) return null;
  return (
    <View className="mb-6">
      <View className="px-4 pb-2">
        <Text className="text-lg font-semibold text-zinc-900">{title}</Text>
        {description !== undefined && (
          <Text className="text-sm text-zinc-500 mt-0.5">{description}</Text>
        )}
      </View>
      <View className="bg-white rounded-lg overflow-hidden border border-zinc-100">
        {invites.map((invite) => (
          <OnetimeInviteListItem
            key={invite.id}
            invite={invite}
            showCommunityLabel
            communityLabel={invite.community?.name ?? null}
            selfInvited={user.id === invite.invitingUser?.id}
            shared={sharedInviteId === invite.id}
            actions={actions}
          />
        ))}
      </View>
    </View>
  );
}
