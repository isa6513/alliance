import { CommunityDto, userGetMyCommunity } from "@alliance/shared/client";
import List from "@alliance/shared/ui/List";
import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import UserDisplayName from "../../components/UserDisplayName";
import CenterLayout from "@alliance/shared/ui/CenterLayout";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";

type Tab = "members" | "about";

const CommunityPage = () => {
  const [community, setCommunity] = useState<CommunityDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userGetMyCommunity().then((resp) => {
      if (resp.data) {
        setCommunity(resp.data);
      }
      setLoading(false);
    });
  }, []);

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
              <div
                key={user.id}
                className="p-4 flex flex-row items-center gap-x-2"
              >
                <UserDisplayName staff={user.staff} underline={false}>
                  {user.displayName}
                </UserDisplayName>
              </div>
            ))}
          </List>
          <p className="font-semibold">Members</p>
          <List>
            {members.map((user) => (
              <div
                key={user.id}
                className="p-4 flex flex-row items-center gap-x-2"
              >
                <UserDisplayName staff={user.staff} underline={false}>
                  {user.displayName}
                </UserDisplayName>
              </div>
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
