import {
  CommunityDto,
  UserActionRelationDetailDto,
  UserActionSummaryDto,
  userGetCommunityMemberContactInfo,
  actionsGetCommunityMemberInfo,
  userGetMyCommunities,
  userLeaveCommunity,
  userGetOnetimeInvitesByCommunity,
  CommunityMemberContactInfoDto,
  conversationGetCommunityConversations,
  ActionSuiteSummaryDto,
} from "@alliance/shared/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Card from "@alliance/sharedweb/ui/Card";
import CommunityMembersTable from "@alliance/sharedweb/ui/CommunityMembersTable";
import { useAuth } from "../../lib/AuthContext";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import CompletedBar from "../../components/CompletedBar";
import {
  GroupMemberGuidelines,
  GroupOrganizerGuidelines,
} from "../../components/GroupGuidelines";
import CommunityEditForm from "../../components/CommunityEditForm";
import { href, useNavigate, useSearchParams } from "react-router";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import CommunityActivityTab from "../../components/CommunityActivityTab";
import TwoColumnLayout from "../../components/TwoColumnLayout";
import FloatingChatPanel from "../../components/FloatingChatpanel";
import { ChevronDown, MessageSquare } from "lucide-react";
import { Features } from "@alliance/shared/lib/features";
import { isFeatureEnabled } from "../../lib/config";
import CommunityInvitesTabLeader from "../../components/CommunityInvitesTabLeader";
import CommunityInvitesTabMember from "../../components/CommunityInvitesTabMember";
import CommunitySelect from "../../components/CommunitySelect";
import BottomSpacer from "@alliance/sharedweb/ui/BottomSpacer";
import { useMediaQuery } from "../../lib/useMediaQuery";
import DropdownSelect from "@alliance/sharedweb/ui/DropdownSelect";
import { CardStyle } from "@alliance/shared/styles/card";
import {
  calculateAllCompletionData,
  CompletionData,
} from "@alliance/shared/lib/actionUtils";
import { useMaxActionsPerWeek } from "@alliance/sharedweb/ui/UserProgressPills";

type Tab =
  | "activity"
  | "members"
  | "invites"
  | "about"
  | "edit"
  | "resources"
  | "select";

const CURRENT_ACTION_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const CURRENT_ACTIONS_DROPDOWN_DISPLAY = "Current actions";

const CommunityPage = () => {
  const [communities, setCommunities] = useState<CommunityDto[] | null>(null);
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

  const tab = searchParams.get("tab") ?? "activity";
  const communityId = searchParams.get("communityId");

  const maxActionsPerWeek = useMaxActionsPerWeek({
    actionSummaries: actionSummaries,
    userActionRelations,
  });
  const [inviteNotifCount, setInviteNotifCount] = useState(0);
  const [suites, setSuites] = useState<Map<
    number,
    ActionSuiteSummaryDto
  > | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<
    typeof CURRENT_ACTIONS_DROPDOWN_DISPLAY | `s${number}`
  >(CURRENT_ACTIONS_DROPDOWN_DISPLAY);
  const [allCompletionData, setAllCompletionData] = useState<ReturnType<
    typeof calculateAllCompletionData
  > | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [community, setCommunity] = useState<CommunityDto | null>(null);

  useEffect(() => {
    if (!community?.id) {
      return;
    }
    conversationGetCommunityConversations({
      path: { communityId: community.id },
    }).then((response) => {
      if (response.data?.lastMessage) {
        setChatOpen(true);
      }
    });
  }, [community?.id]);

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    userGetMyCommunities().then((resp) => {
      if (resp.data) {
        resp.data.forEach(
          (community) =>
            (community.users = community.users.filter(
              (user) => user.hasActiveContract
            ))
        );
        setCommunities(resp.data);
        setCommunity(
          (communityId
            ? resp.data?.find(
                (community) => community.id.toString() === communityId
              )
            : resp.data?.[0]) ?? null
        );
      }
      setLoading(false);
    });
  }, [communityId]);

  const messagingEnabled = useMemo(() => {
    return isFeatureEnabled(Features.Messaging);
  }, []);

  const amLeader = useMemo(() => {
    return community?.leaders.some((leader) => leader.id === user?.id);
  }, [community, user]);

  useEffect(() => {
    if (!community || !amLeader) {
      return;
    }
    (async () => {
      const invites = await userGetOnetimeInvitesByCommunity({
        path: { communityId: community.id },
      });
      if (!invites.data) {
        return;
      }
      setInviteNotifCount(
        invites.data.filter((invite) => invite.status === "request_pending")
          .length
      );
    })();
  }, [amLeader, community]);

  useEffect(() => {
    actionsGetCommunityMemberInfo().then((resp) => {
      if (!resp.data) {
        return;
      }

      setUserActionRelations(
        Object.fromEntries(
          resp.data.users.map(({ userId, relations }) => [userId, relations])
        )
      );

      // Most recent actions first
      resp.data.actions.reverse();

      setActionSummaries(resp.data.actions);
      const completionData = calculateAllCompletionData({
        actions: resp.data.actions,
        users: resp.data.users,
        actionDeadlineWindowMs: CURRENT_ACTION_WINDOW_MS,
      });
      setAllCompletionData(completionData);
      setSuites(new Map(resp.data.suites.map((suite) => [suite.id, suite])));
      setSelectedSuite(CURRENT_ACTIONS_DROPDOWN_DISPLAY);
    });
  }, []);

  useEffect(() => {
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
  const suiteDropdownOptions = useMemo(() => {
    if (!suites || !allCompletionData?.bySuiteId) {
      return null;
    }
    return Object.fromEntries([
      [CURRENT_ACTIONS_DROPDOWN_DISPLAY, CURRENT_ACTIONS_DROPDOWN_DISPLAY],
      ...Array.from(suites)
        .filter(([suiteId]) => allCompletionData.bySuiteId.has(suiteId))
        .map(([suiteId, suite]) => [`s${suiteId}`, suite.name]),
    ]) as Record<
      typeof CURRENT_ACTIONS_DROPDOWN_DISPLAY | `s${number}`,
      string
    >;
  }, [suites, allCompletionData]);

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

  const setCommunityId = useCallback(
    (communityId: number | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (communityId === null) {
          next.delete("communityId");
        } else {
          next.set("communityId", communityId.toString());
        }
        next.delete("tab");
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
      title: "Leave group",
      message:
        "Are you sure you want to leave this group? You will not be able to rejoin unless you are invited again.",
      confirmLabel: "Leave",
      cancelLabel: "Cancel",
    });
    if (!ok) {
      return;
    }

    userLeaveCommunity({ path: { communityId: community.id } }).then((resp) => {
      if (resp.response.ok) {
        navigate(href("/tasks"));
      }
    });
  }, [community, navigate, confirm]);

  const tabs: Tab[] = amLeader
    ? ["activity", "members", "invites", "resources"]
    : ["activity", "members", "invites", "about"];

  const isLargeScreen = useMediaQuery("(min-width: 1250px)");
  const isChatOpen = messagingEnabled && chatOpen;

  const completionData = useMemo<CompletionData>(() => {
    if (!allCompletionData) {
      return {
        completedAllCurrentActions: {},
        nCompleted: 0,
        nTotal: 0,
        nActions: 0,
      };
    }
    if (allCompletionData.previous) {
      return allCompletionData.previous;
    }
    if (selectedSuite === CURRENT_ACTIONS_DROPDOWN_DISPLAY) {
      return allCompletionData.current;
    }
    return (
      allCompletionData.bySuiteId.get(Number(selectedSuite.slice(1))) ?? {
        completedAllCurrentActions: {},
        nCompleted: 0,
        nTotal: 0,
        nActions: 0,
      }
    );
  }, [allCompletionData, selectedSuite]);
  const actionDisplay = useMemo(() => {
    if (!allCompletionData) {
      return "current actions";
    }

    if (allCompletionData.previous) {
      return allCompletionData.previous.nActions === 1
        ? "the previous action"
        : "previous actions";
    }

    if (selectedSuite === CURRENT_ACTIONS_DROPDOWN_DISPLAY) {
      return allCompletionData.current.nActions !== 1
        ? "current actions"
        : "the current action";
    }

    const suiteId = selectedSuite ? Number(selectedSuite.slice(1)) : null;
    if (suiteId === null) {
      return "current actions";
    }
    const suiteCompletionData = allCompletionData.bySuiteId.get(suiteId);
    if (!suiteCompletionData) {
      return "current actions";
    }
    return suiteCompletionData.nActions === 1
      ? "the selected action"
      : "selected actions";
  }, [selectedSuite, allCompletionData]);

  if (!community) {
    if (loading) {
      return <Spinner />;
    }
    return (
      <div className="flex justify-center items-center h-[calc(100vh-var(--nav-height))]">
        <p className="text-zinc-500 pb-20">
          You are not a member of a group yet.
        </p>
      </div>
    );
  }

  const leaders = community.leaders;
  const nonLeaderMembers = community.users.filter(
    (user) => !leaders.some((leader) => leader.id === user.id)
  );

  return (
    <TwoColumnLayout
      main={
        <div className="p-5 xl:p-10 xl:pr-5 max-w-[900px] mx-auto px-0 md:px-3">
          <div className="flex flex-col gap-y-2 my-8 px-5 md:px-0">
            <div className="flex flex-row gap-x-2 items-start justify-between">
              <div className="flex flex-col gap-y-4 mb-8">
                {communities && communities.length > 1 ? (
                  <Button
                    color={ButtonColor.Transparent}
                    onClick={() => {
                      setTab("select");
                    }}
                    className="font-serif font-semibold text-3xl md:text-4xl"
                  >
                    {community.name}&nbsp;<ChevronDown />
                  </Button>
                ) : (
                  <p className="font-serif font-semibold text-3xl md:text-4xl">
                    {community.name}
                  </p>
                )}
                <AppMarkdownWrapper markdownContent={community.description} />
              </div>

              {amLeader ? (
                <Button
                  color={ButtonColor.White}
                  onClick={() => setTab("edit")}
                  className="!text-sm"
                >
                  Edit
                </Button>
              ) : (
                <Button
                  color={ButtonColor.White}
                  onClick={handleLeave}
                  className="!text-sm"
                >
                  Leave group
                </Button>
              )}
            </div>

            <div
              className={`max-w-[400px] ${
                completionData.nTotal === 0 ? " invisible" : ""
              }`}
            >
              {amLeader && suiteDropdownOptions && (
                <>
                  <DropdownSelect
                    options={suiteDropdownOptions}
                    value={suiteDropdownOptions[selectedSuite]}
                    onChange={([selectedSuite]) =>
                      setSelectedSuite(selectedSuite)
                    }
                  ></DropdownSelect>
                  <br />
                </>
              )}

              <p className="text-sm">
                {completionData.nCompleted} / {completionData.nTotal} have
                completed {actionDisplay}
              </p>
              <CompletedBar
                percentage={
                  completionData.nTotal === 0
                    ? 100
                    : (completionData.nCompleted / completionData.nTotal) * 100
                }
                height="h-4"
                dark
              />
            </div>
          </div>
          <div className="flex flex-row gap-x-2 justify-start mb-4 border-b border-zinc-200">
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
                <div className="flex flex-row gap-x-2">
                  <span className="capitalize">{m}</span>
                  {m === "invites" && inviteNotifCount > 0 && (
                    <div className="font-semibold text-xs text-white bg-zinc-500 rounded-md flex justify-center items-center w-5 h-5">
                      {inviteNotifCount}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
          {tab === "activity" && (
            <CommunityActivityTab
              communityId={community.id}
              userId={user?.id}
            />
          )}
          {tab === "members" && (
            <CommunityMembersTable
              leaders={leaders}
              members={nonLeaderMembers}
              amLeader={amLeader ?? false}
              memberContactInfo={memberContactInfo ?? undefined}
              userActionRelations={userActionRelations ?? undefined}
              actions={actionSummaries}
              maxActionsPerWeek={maxActionsPerWeek}
              completedAllCurrentActions={
                completionData.completedAllCurrentActions
              }
            />
          )}
          {tab === "about" && (
            <div className="flex flex-col gap-y-4 py-4">
              <GroupMemberGuidelines />
            </div>
          )}
          {tab === "resources" && (
            <div className="flex flex-col gap-y-4 py-4">
              <GroupOrganizerGuidelines />
            </div>
          )}
          {tab === "invites" &&
            (amLeader ? (
              <CommunityInvitesTabLeader
                communityId={community.id}
                existingMembers={community.users}
                setInviteNotifCount={setInviteNotifCount}
              />
            ) : (
              <CommunityInvitesTabMember communityId={community.id} />
            ))}
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
          {tab === "select" && (
            <CommunitySelect
              currentCommunityId={community.id}
              onSelectCommunity={setCommunityId}
              communities={communities}
            />
          )}
          <BottomSpacer />
          {!chatOpen && messagingEnabled && isLargeScreen && (
            <div className="absolute bottom-5 right-7 bg-white hover:bg-zinc-100">
              <Button
                color={ButtonColor.Outline}
                onClick={() => setChatOpen(true)}
                className="!px-3 !py-3"
              >
                <MessageSquare size="20" />
              </Button>
            </div>
          )}
        </div>
      }
      sidebar={
        messagingEnabled && isLargeScreen ? (
          <div
            className="p-10 h-screen px-5 transition-all duration-200 ease-in-out"
            style={{
              transform: chatOpen ? "translateY(0)" : "translateY(100%)",
            }}
          >
            <Card className="h-full !p-0">
              <FloatingChatPanel
                communityId={community.id}
                onClose={() => setChatOpen(false)}
              />
            </Card>
          </div>
        ) : null
      }
      sidebarWidth={isChatOpen && isLargeScreen ? 500 : 0}
      noSidebarOverflow
    />
  );
};

export default CommunityPage;
