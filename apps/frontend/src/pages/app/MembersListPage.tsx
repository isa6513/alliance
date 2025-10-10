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

export async function clientLoader() {
  const members = await userMembersWithFriends();
  const userSentFriendRequests = await userListSentRequests();

  return {
    members: members.data ?? [],
    userSentFriendRequestIds: userSentFriendRequests.data
      ? userSentFriendRequests.data.map((req) => req.id)
      : [],
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

  const myFriends = user?.friends.map((friend) => friend.id) ?? [];
  const friendsOfFriends = members.filter(
    (member) =>
      member.id !== user?.id &&
      !myFriends.includes(member.id) &&
      member.friends.some((friend) => myFriends.includes(friend.id))
  );

  return (
    <div className="max-w-[800px] px-2 mx-auto flex flex-col gap-y-4 pb-16">
      <p className="text-lg md:text-2xl font-serif font-medium pt-10 relative w-fit">
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

      <List>
        {(filterMode === MemberFilterMode.All ? members : friendsOfFriends).map(
          (member) => (
            <MembersListItem
              key={member.id}
              profile={member}
              sentFriendRequest={userSentFriendRequestIds.includes(member.id)}
            />
          )
        )}
      </List>
    </div>
  );
};

export default MembersListPage;
