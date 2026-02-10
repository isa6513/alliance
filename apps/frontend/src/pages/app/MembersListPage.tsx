import {
  ProfileDtoWithFriends,
  userListFriends,
  userListSentRequests,
  userMembersWithFriends,
} from "@alliance/shared/client";

import MembersListItem from "../../components/MembersListItem";
import List from "@alliance/sharedweb/ui/List";
import DropdownSelect from "@alliance/sharedweb/ui/DropdownSelect";
import { useAuth } from "../../lib/AuthContext";
import { useMemo, useState } from "react";
import BasicErrorMessage from "../../components/BasicErrorMessage";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useQuery } from "@tanstack/react-query";

export enum MemberFilterMode {
  All = "All",
  FriendsOfFriends = "Friends of friends",
  Staff = "Staff",
}

const MembersListPage = () => {
  const { user } = useAuth();

  const {
    data: members = [],
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: ["userMembersWithFriends", { requireSignedContract: true }],
    queryFn: () =>
      userMembersWithFriends({ query: { requireSignedContract: true } }).then(
        (res) => res.data ?? []
      ),
  });

  const { data: sentRequests = [], isLoading: isLoadingSentRequests } =
    useQuery({
      queryKey: ["userListSentRequests"],
      queryFn: () => userListSentRequests().then((res) => res.data ?? []),
    });

  const { data: friendsData = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ["userListFriends", user?.id],
    queryFn: () =>
      userListFriends({ path: { id: user!.id } }).then(
        (res) => res.data ?? []
      ),
    enabled: !!user,
  });

  const userSentFriendRequestIds = useMemo(
    () => sentRequests.map((req) => req.id),
    [sentRequests]
  );

  const myFriends = useMemo(
    () => friendsData.map((friend) => friend.id),
    [friendsData]
  );

  const loading = isLoadingMembers || isLoadingSentRequests || isLoadingFriends;
  const error = membersError ? "Could not load members" : null;

  const [filterMode, setFilterMode] = useState<MemberFilterMode>(
    MemberFilterMode.All
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filterBySearch = (member: ProfileDtoWithFriends) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return member.displayName.toLowerCase().includes(query);
  };

  const allFriendsOfFriends = members.filter(
    (member) =>
      member.id !== user?.id &&
      !myFriends.includes(member.id) &&
      member.friends.some((friend) => myFriends.includes(friend.id))
  );

  const allOtherMembers = members.filter(
    (member) => !allFriendsOfFriends.some((fof) => fof.id === member.id)
  );

  const friendsOfFriends = allFriendsOfFriends.filter(filterBySearch);
  const otherMembers = allOtherMembers.filter(filterBySearch);
  const staffMembers = members.filter((member) => member.staff);

  const secondaryLabels = {
    [MemberFilterMode.All]: members.length.toString(),
    [MemberFilterMode.FriendsOfFriends]: friendsOfFriends.length.toString(),
    [MemberFilterMode.Staff]: staffMembers.length.toString(),
  };

  const renderMembers = (list: ProfileDtoWithFriends[]) => (
    <List>
      {list.map((member) => (
        <MembersListItem
          key={member.id}
          profile={member}
          sentFriendRequest={userSentFriendRequestIds.includes(member.id)}
          isFriend={myFriends.includes(member.id)}
        />
      ))}
    </List>
  );

  return (
    <CenterLayout className="gap-y-4" width="3xl">
      <div className="md:mt-8 flex flex-row gap-x-6 items-center">
        <p className="text-2xl md:text-3xl font-serif font-medium">
          Members {members.length > 0 ? `(${members.length})` : ""}
        </p>

        <DropdownSelect
          options={MemberFilterMode}
          secondaryLabel={([, mode]) => secondaryLabels[mode]}
          value={filterMode}
          onChange={([, mode]) => setFilterMode(mode)}
        />
      </div>

      {loading && (
        <div className="mx-auto">
          <Spinner />
        </div>
      )}

      {error && <BasicErrorMessage>{error}</BasicErrorMessage>}

      {!loading && !error && (
        <>
          <div className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border bg-white border-zinc-200 py-2 px-3 rounded focus:outline-none"
              />
            </div>
          </div>

          {filterMode === MemberFilterMode.All && (
            <>
              {members.length > 0 ? (
                renderMembers([...friendsOfFriends, ...otherMembers])
              ) : (
                <p className="text-center text-zinc-500 py-4">None found</p>
              )}
            </>
          )}

          {filterMode === MemberFilterMode.FriendsOfFriends && (
            <>
              {friendsOfFriends.length > 0 ? (
                renderMembers(friendsOfFriends)
              ) : (
                <p className="text-center text-zinc-500 py-4">None found</p>
              )}
            </>
          )}

          {filterMode === MemberFilterMode.Staff && (
            <>
              {staffMembers.length > 0 ? (
                renderMembers(staffMembers)
              ) : (
                <p className="text-center text-zinc-500 py-4">None found</p>
              )}
            </>
          )}
        </>
      )}
    </CenterLayout>
  );
};

export default MembersListPage;
