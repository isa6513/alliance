import { userMembers } from "@alliance/shared/client";
import { useLoaderData } from "react-router";
import MembersListCard from "../../components/MembersListCard";

export async function clientLoader() {
  const members = await userMembers();
  if (!members.data) {
    throw new Error("Failed to load members");
  }
  return {
    members: members.data,
  };
}

const MembersListPage = () => {
  const { members } = useLoaderData<typeof clientLoader>();
  return (
    <div className="max-w-[800px] mx-auto flex flex-col gap-y-4">
      <p className="text-lg md:text-2xl font-adobe pt-10 relative w-fit">
        Members ({members.length})
      </p>
      <div className="flex flex-col gap-2 justify-center w-full">
        {members.map((member) => (
          <MembersListCard key={member.id} profile={member} />
        ))}
      </div>
    </div>
  );
};

export default MembersListPage;
