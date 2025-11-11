import {
  CommunityDto,
  UserDto,
  userGetCommunityMemberInfo,
  userGetMyCommunity,
} from "@alliance/shared/client";
import List from "@alliance/shared/ui/List";
import { useEffect, useMemo, useState } from "react";
import Spinner from "../../components/Spinner";
import CenterLayout from "@alliance/shared/ui/CenterLayout";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";
import CommunityMemberCard from "../../components/CommunityMemberCard";
import { useAuth } from "../../lib/AuthContext";

type Tab = "members" | "about";

const CommunityPage = () => {
  const [community, setCommunity] = useState<CommunityDto | null>(null);
  const [memberInfo, setMemberInfo] = useState<Record<number, UserDto> | null>(
    null
  );

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
          setMemberInfo(
            resp.data.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {} as Record<number, UserDto>)
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
          <p className="font-semibold">Leader{leaders.length > 1 ? "s" : ""}</p>
          <List>
            {leaders.map((user) => (
              <CommunityMemberCard
                key={user.id}
                profile={user}
                actionRelations={[]}
              />
            ))}
          </List>
          <p className="font-semibold">Members</p>
          <List>
            {members.map((user) => (
              <CommunityMemberCard
                key={user.id}
                profile={user}
                user={memberInfo?.[user.id]}
                actionRelations={[]}
              />
            ))}
          </List>
        </div>
      )}
      {tab === "about" && (
        <Card>
          <p>{community.description}</p>
        </Card>
      )}
    </CenterLayout>
  );
};

export default CommunityPage;
