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
    <div className="flex flex-col gap-y-4 items-center">
      <p className="text-lg md:text-2xl font-sabon text-center pt-10 pb-3 relative w-fit">
        The Alliance Platform has{" "}
        <span className="p-1 px-2 border border-zinc-400 rounded-md font-sabon">
          {members.length}
        </span>{" "}
        members.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 justify-center w-full px-15">
        {members.map((member) => (
          <MembersListCard key={member.id} profile={member} />
        ))}
      </div>
    </div>
  );
};

export default MembersListPage;
