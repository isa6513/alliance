import {
  CommunityDto,
  CommunityMemberContactInfoDto,
  UserActionRelationDetailDto,
  UserActionSummaryDto,
  userGetCommunityMemberContactInfo,
  userGetCommunityMemberInfo,
  userGetMyCommunity,
  userLeaveCommunity,
} from "@alliance/shared/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "../../components/Spinner";
import CenterLayout from "@alliance/shared/ui/CenterLayout";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import CommunityMemberTableRow from "../../components/CommunityMemberTableRow";
import { useAuth } from "../../lib/AuthContext";
import AppMarkdownWrapper from "@alliance/shared/ui/AppMarkdownWrapper";
import CompletedBar from "../../components/CompletedBar";
import DropdownSelect from "@alliance/shared/ui/DropdownSelect";
import {
  GroupMemberGuidelines,
  GroupOrganizerGuidelines,
} from "../../components/GroupGuidelines";
import CommunityEditForm from "../../components/CommunityEditForm";
import CommunityInvitesTab from "../../components/CommunityInvitesTab";
import { useNavigate, useSearchParams } from "react-router";
import { useToast } from "@alliance/shared/ui/ToastProvider";

type Tab = "members" | "invites" | "about" | "edit";

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

  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get("tab") ?? "members";

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

  const setTab = useCallback(
    (tab: Tab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tab);
        return next;
      });
    },
    [setSearchParams]
  );

  const navigate = useNavigate();

  const { confirm } = useToast();

  const handleLeave = useCallback(async () => {
    if (!community) {
      return;
    }
    const ok = await confirm({
      title: "Leave community",
      message:
        "Are you sure you want to leave this community? You will not be able to rejoin unless you are invited again.",
      confirmLabel: "Leave",
      cancelLabel: "Cancel",
    });
    if (!ok) {
      return;
    }

    userLeaveCommunity({ path: { communityId: community.id } }).then((resp) => {
      if (resp.response.ok) {
        navigate("/tasks");
      }
    });
  }, [community, navigate, confirm]);

  const tabs: Tab[] = amLeader
    ? ["members", "invites", "about"]
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
        <div className="flex flex-row gap-x-2 items-start justify-between">
          <div className="flex flex-col gap-y-4 mb-8">
            <p className="font-serif font-semibold text-3xl md:text-5xl">
              {community.name}
            </p>
            <AppMarkdownWrapper markdownContent={community.description} />
          </div>

          {amLeader ? (
            <Button color={ButtonColor.Light} onClick={() => setTab("edit")}>
              Edit
            </Button>
          ) : (
            <Button color={ButtonColor.Light} onClick={handleLeave}>
              Leave community
            </Button>
          )}
        </div>

        <div className="w-1/2">
          <p className="text-sm">
            {nCompleted} / {community.users.length} have completed current
            actions
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
        <div className="flex flex-col">
          <div className="">
            <table className="w-full border-collapse">
              <thead className="text-left bg-white">
                <tr>
                  <td colSpan={3} className="px-0 pb-6">
                    <p className="text-xl md:text-2xl font-semibold">
                      Lead{leaders.length !== 1 ? "s" : ""}
                    </p>
                  </td>
                </tr>
              </thead>
              <thead className="text-left bg-zinc-50">
                <tr className="*:py-4 *:px-2 *:md:px-4 border border-zinc-200 text-xs md:text-sm text-zinc-600">
                  <th scope="col" className="font-medium">
                    Name
                  </th>
                  <th scope="col" className="font-medium">
                    Action history
                  </th>
                  {amLeader && (
                    <th
                      scope="col"
                      className="font-medium md:whitespace-nowrap"
                    >
                      Preferred contact time
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="border border-zinc-200">
                {leaders.map((user) => (
                  <CommunityMemberTableRow
                    key={user.id}
                    profile={user}
                    canExpand={amLeader}
                    amLeader={amLeader}
                    contactInfo={memberContactInfo?.[user.id]}
                    actionRelations={userActionRelations?.[user.id] ?? []}
                    actions={actionSummaries}
                  />
                ))}
              </tbody>
              <thead className="text-left bg-white">
                <tr>
                  <td
                    colSpan={3}
                    className="px-0 pt-10 pb-6 border-y border-zinc-200"
                  >
                    <div className="flex flex-row items-center gap-x-4">
                      <p className="text-xl md:text-2xl font-semibold">
                        Members
                      </p>
                      <DropdownSelect
                        options={Object.values(FilterMode)}
                        secondaryLabels={Object.values(FilterMode).map((mode) =>
                          mode === FilterMode.All
                            ? members.length.toString()
                            : members
                                .filter(
                                  (user) => !completedAllCurrentActions[user.id]
                                )
                                .length.toString()
                        )}
                        value={filterMode}
                        onChange={(mode) => setFilterMode(mode as FilterMode)}
                      />
                    </div>
                  </td>
                </tr>
              </thead>
              <thead className="text-left bg-zinc-50">
                <tr className="*:py-4 *:px-2 *:md:px-4 border border-zinc-200 text-xs md:text-sm text-zinc-600">
                  <th scope="col" className="font-medium">
                    Name
                  </th>
                  <th scope="col" className="font-medium">
                    Action history
                  </th>
                  {amLeader && (
                    <th
                      scope="col"
                      className="font-medium md:whitespace-nowrap"
                    >
                      Preferred contact time
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="border border-zinc-200">
                {filteredMembers.map((user) => (
                  <CommunityMemberTableRow
                    key={user.id}
                    profile={user}
                    canExpand={amLeader}
                    amLeader={amLeader}
                    contactInfo={memberContactInfo?.[user.id]}
                    actionRelations={userActionRelations?.[user.id] ?? []}
                    actions={actionSummaries}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === "about" && (
        <div className="flex flex-col gap-y-4">
          {amLeader ? <GroupOrganizerGuidelines /> : <GroupMemberGuidelines />}
        </div>
      )}
      {tab === "invites" && <CommunityInvitesTab communityId={community.id} />}
      {tab === "edit" && (
        <Card style={CardStyle.Grey}>
          <CommunityEditForm
            initialValue={community}
            onCancel={() => setTab("members")}
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
