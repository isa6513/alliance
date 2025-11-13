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

type Tab = "members" | "about";

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
    if (amLeader) {
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
  const tabs: Tab[] = ["members", "about"];

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

  return (
    <CenterLayout>
      <Card className="my-5" style={CardStyle.Grey}>
        <p className="text-sm font-semibold">
          {nCompleted} of {community.users.length} members have completed
          current actions
        </p>
        <CompletedBar
          percentage={(nCompleted / community.users.length) * 100}
          height="h-5"
          dark
        />
      </Card>
      <div className=" flex flex-row gap-x-2 justify-start mb-4">
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
        <div className="flex flex-col gap-y-2">
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
          <p className="font-semibold">Members</p>
          <List>
            {members.map((user) => (
              <CommunityMemberCard
                key={user.id}
                canExpand={amLeader}
                profile={user}
                contactInfo={memberContactInfo?.[user.id]}
                actionRelations={userActionRelations?.[user.id] ?? []}
                actions={actionSummaries}
                completedAllCurrentActions={completedAllCurrentActions[user.id]}
              />
            ))}
          </List>
        </div>
      )}
      {tab === "about" && (
        <Card>
          <AppMarkdownWrapper markdownContent={community.description} />
        </Card>
      )}
    </CenterLayout>
  );
};

export default CommunityPage;
