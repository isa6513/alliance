import {
  userListSentRequests,
  userMembersWithFriends,
} from "@alliance/shared/client";
import { useLoaderData } from "react-router";
import MembersListItem from "../../components/MembersListItem";
import List from "@alliance/shared/ui/List";
import DropdownSelect from "@alliance/shared/ui/DropdownSelect";
import { useAuth } from "../../lib/AuthContext";
import { useState } from "react";
import BasicErrorMessage from "../../components/BasicErrorMessage";
import CenterLayout from "@alliance/shared/ui/CenterLayout";

export async function clientLoader() {
  const members = await userMembersWithFriends({
    query: { requireSignedContract: true },
  });
  const userSentFriendRequests = await userListSentRequests();

  return {
    members: members.data ?? null,
    userSentFriendRequestIds: userSentFriendRequests.data
      ? userSentFriendRequests.data.map((req) => req.id)
      : null,
  };
}

export enum MemberFilterMode {
  All = "All",
  FriendsOfFriends = "Friends of friends",
}

const MembersListPage = () => {
  const { user } = useAuth();
  const { members, userSentFriendRequestIds } =
    useLoaderData<typeof clientLoader>();

  const [filterMode, setFilterMode] = useState<MemberFilterMode>(
    MemberFilterMode.All
  );

  if (members === null) {
    return <BasicErrorMessage>Could not load members</BasicErrorMessage>;
  }

  const myFriends = user?.friends.map((friend) => friend.id) ?? [];
  const friendsOfFriends = members.filter(
    (member) =>
      member.id !== user?.id &&
      !myFriends.includes(member.id) &&
      member.friends.some((friend) => myFriends.includes(friend.id))
  );

  const selectedMembers =
    filterMode === MemberFilterMode.All ? members : friendsOfFriends;

  return (
    <CenterLayout className="gap-y-4" width="3xl">
      <div className="flex flex-row gap-x-6 items-center">
        <p className="text-lg md:text-2xl font-serif font-medium relative w-fit -mt-1">
          Members ({members.length})
        </p>

        <DropdownSelect
          options={Object.values(MemberFilterMode)}
          secondaryLabels={Object.values(MemberFilterMode).map((mode) =>
            mode === MemberFilterMode.All
              ? members.length.toString()
              : friendsOfFriends.length.toString()
          )}
          value={filterMode}
          onChange={(value) => {
            setFilterMode(value as MemberFilterMode);
          }}
        />
      </div>

      {selectedMembers.length > 0 ? (
        <List>
          {selectedMembers.map((member) => (
            <MembersListItem
              key={member.id}
              profile={member}
              sentFriendRequest={userSentFriendRequestIds?.includes(member.id)}
            />
          ))}
        </List>
      ) : (
        <p className="text-center text-zinc-500 py-5">None found</p>
      )}
    </CenterLayout>
  );
};

export default MembersListPage;
