import { userMembers } from "@alliance/shared/client";
import { useLoaderData } from "react-router";
import MembersListItem from "../../components/MembersListItem";
import List from "@alliance/shared/ui/List";

export async function clientLoader() {
  const members = await userMembers();

  return {
    members: members.data ?? [],
  };
}

const MembersListPage = () => {
  const { members } = useLoaderData<typeof clientLoader>();
  return (
    <div className="max-w-[800px] px-2 mx-auto flex flex-col gap-y-4 pb-16">
      <p className="text-lg md:text-2xl font-serif font-medium pt-10 relative w-fit">
        Members ({members.length})
      </p>
      <List>
        {members.map((member) => (
          <MembersListItem key={member.id} profile={member} />
        ))}
      </List>
    </div>
  );
};

export default MembersListPage;
