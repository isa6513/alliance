import {
  CommunityDto,
  CommunityMemberContactInfoDto,
  UserActionRelationDetailDto,
  UserActionSummaryDto,
  userGetCommunityMemberContactInfo,
  userGetCommunityMemberInfo,
  userGetMyCommunity,
} from "@alliance/shared/client";
import List from "@alliance/shared/ui/List";
import { useEffect, useMemo, useState } from "react";
import Spinner from "../../components/Spinner";
import CenterLayout from "@alliance/shared/ui/CenterLayout";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import CommunityMemberCard from "../../components/CommunityMemberCard";
import { useAuth } from "../../lib/AuthContext";
import AppMarkdownWrapper from "@alliance/shared/ui/AppMarkdownWrapper";
import CompletedBar from "../../components/CompletedBar";
import DropdownSelect from "@alliance/shared/ui/DropdownSelect";
import GroupOrganizerGuidelines from "../../components/GroupOrganizerGuidelines";
import StatusIcon from "@alliance/shared/ui/icons/StatusIcon";
import CommunityEditForm from "../../components/CommunityEditForm";
import CommunityInvitesTab from "../../components/CommunityInvitesTab";

type Tab = "members" | "about" | "invites" | "edit";

export enum FilterMode {
  All = "All",
  NotYetCompleted = "Not yet completed",
}

const CommunityPage = () => {
  const [community, setCommunity] = useState<CommunityDto | null>(null);
  const [memberContactInfo, setMemberContactInfo] = useState<Record<
    number,
    CommunityMemberContactInfoDto
  > | null>(null);
  const [userActionRelations, setUserActionRelations] = useState<Record<
    number,
    UserActionRelationDetailDto[]
  > | null>(null);

  const [actionSummaries, setActionSummaries] = useState<
    UserActionSummaryDto[]
  >([]);

  const [activeActions, setActiveActions] = useState<UserActionSummaryDto[]>(
    []
  );

  const [completedAllCurrentActions, setCompletedAllCurrentActions] = useState<
    Record<number, boolean>
  >({});

  const nCompleted = useMemo(() => {
    if (!community?.users || !userActionRelations) {
      return 0;
    }
    const completedall: Record<number, boolean> = {};
    const completedUsers = new Set<number>();
    for (const action of activeActions) {
      for (const member of community?.users ?? []) {
        const relation = userActionRelations?.[member.id]?.find(
          (relation) => relation.actionId === action.id
        );
        if (relation?.status === "completed") {
          completedUsers.add(member.id);
          completedall[member.id] = true;
        }
      }
    }
    setCompletedAllCurrentActions(completedall);
    return completedUsers.size;
  }, [activeActions, community, userActionRelations]);

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    userGetMyCommunity().then((resp) => {
      if (resp.data) {
        setCommunity(resp.data);
      }
      setLoading(false);
    });
  }, []);

  const amLeader = useMemo(() => {
    return community?.leaders.some((leader) => leader.id === user?.id);
  }, [community, user]);

  useEffect(() => {
    userGetCommunityMemberInfo().then((resp) => {
      if (resp.data) {
        setActionSummaries(resp.data.actions);
        setActiveActions(
          resp.data.actions.filter(
            (action) => action.status === "member_action"
          )
        );
        setUserActionRelations(
          resp.data.users.reduce((acc, user) => {
            acc[user.userId] = user.relations;
            return acc;
          }, {} as Record<number, UserActionRelationDetailDto[]>)
        );
      }
    });
    if (amLeader) {
      userGetCommunityMemberContactInfo().then((resp) => {
        if (resp.data) {
          setMemberContactInfo(
            resp.data.reduce((acc, contactInfo) => {
              acc[contactInfo.id] = contactInfo;
              return acc;
            }, {} as Record<number, CommunityMemberContactInfoDto>)
          );
        }
      });
    }
  }, [amLeader]);

  const [tab, setTab] = useState<Tab>("members");
  const tabs: Tab[] = amLeader
    ? ["members", "about", "invites"]
    : ["members", "about"];
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);

  if (!community) {
    if (loading) {
      return <Spinner />;
    }
    return (
      <div className="flex justify-center items-center h-[calc(100vh-var(--nav-height))]">
        <p className="text-zinc-500 pb-20">
          You are not a member of a community yet.
        </p>
      </div>
    );
  }

  const leaders = community.leaders;
  const members = community.users.filter(
    (user) => !leaders.some((leader) => leader.id === user.id)
  );

  const filteredMembers =
    filterMode === FilterMode.All
      ? members
      : members.filter((user) => !completedAllCurrentActions[user.id]);

  return (
    <CenterLayout>
      <div className="flex flex-col gap-y-2 my-8">
        <div className="flex flex-row gap-x-2 items-center justify-between">
          <p className="font-serif font-semibold text-3xl md:text-4xl mb-4">
            {community.name}
          </p>
          {amLeader && (
            <Button color={ButtonColor.Light} onClick={() => setTab("edit")}>
              Edit
            </Button>
          )}
        </div>

        <div className="w-1/2">
          <p className="text-sm">
            {nCompleted} of {community.users.length} members have completed
            current actions
          </p>
          <CompletedBar
            percentage={(nCompleted / community.users.length) * 100}
            height="h-4"
            dark
          />
        </div>
      </div>
      <div className="flex flex-row gap-x-2 justify-start mb-8 border-b border-zinc-200">
        {tabs.map((m) => (
          <Button
            color={ButtonColor.Transparent}
            key={m}
            onClick={() => setTab(m)}
            aria-pressed={m === tab}
            className={`!border-b-[1.5px] rounded-none ${
              m === tab ? "!border-b-green" : "!border-b-transparent"
            }`}
          >
            <p className="capitalize">{m}</p>
          </Button>
        ))}
      </div>
      {tab === "members" && (
        <div className="flex flex-col gap-y-4">
          <p className="font-semibold">
            Organizer{leaders.length > 1 ? "s" : ""}
          </p>
          <List>
            {leaders.map((user) => (
              <CommunityMemberCard
                key={user.id}
                profile={user}
                contactInfo={memberContactInfo?.[user.id]}
                actionRelations={userActionRelations?.[user.id] ?? []}
                actions={actionSummaries}
                completedAllCurrentActions={completedAllCurrentActions[user.id]}
              />
            ))}
          </List>
          <div className="flex flex-col gap-y-2 mt-4">
            <p className="font-semibold">Members</p>
            <div className="flex flex-row justify-start items-center mb-2">
              <p className="mr-4">Filter by:</p>
              <DropdownSelect
                options={Object.values(FilterMode)}
                secondaryLabels={Object.values(FilterMode).map((mode) =>
                  mode === FilterMode.All
                    ? members.length.toString()
                    : members
                        .filter((user) => !completedAllCurrentActions[user.id])
                        .length.toString()
                )}
                value={filterMode}
                onChange={(mode) => setFilterMode(mode as FilterMode)}
              />
            </div>
            <List>
              {filteredMembers.map((user) => (
                <CommunityMemberCard
                  key={user.id}
                  canExpand={amLeader}
                  profile={user}
                  contactInfo={memberContactInfo?.[user.id]}
                  actionRelations={userActionRelations?.[user.id] ?? []}
                  actions={actionSummaries}
                  completedAllCurrentActions={
                    completedAllCurrentActions[user.id]
                  }
                />
              ))}
            </List>
          </div>
        </div>
      )}
      {tab === "about" && (
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <p className="font-semibold">Description</p>
            <AppMarkdownWrapper markdownContent={community.description} />
          </div>
          <div className="flex flex-row items-center">
            <StatusIcon
              status="gathering_commitments"
              size="large"
              fill="var(--color-zinc-400)"
            />
            <p className="text-sm text-zinc-500 font-medium">
              {community.users.length} members
            </p>
          </div>
          {amLeader && (
            <Card style={CardStyle.Grey}>
              <GroupOrganizerGuidelines />
            </Card>
          )}
        </div>
      )}
      {tab === "invites" && <CommunityInvitesTab communityId={community.id} />}
      {tab === "edit" && (
        <Card style={CardStyle.Grey}>
          <CommunityEditForm
            initialValue={community}
            onSuccess={() => {
              window.location.reload();
            }}
          />
        </Card>
      )}
    </CenterLayout>
  );
};

export default CommunityPage;
