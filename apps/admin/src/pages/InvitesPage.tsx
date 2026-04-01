import {
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  userCreateOnetimeInvite,
  userGetOnetimeInvites,
  userList,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Card from "@alliance/sharedweb/ui/Card";
import { useEffect, useMemo, useState } from "react";
import UserSelect, { UserSelectUser } from "@alliance/sharedweb/ui/UserSelect";
import List from "@alliance/sharedweb/ui/List";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import CopyIcon from "@alliance/sharedweb/ui/icons/CopyIcon";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import { Link } from "react-router";

const InvitesPage = () => {
  const [invites, setInvites] = useState<OnetimeInviteDto[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!selectedUser) {
      return;
    }
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    console.log(formData.get("invitee"));
    const body = {
      invitingUserId: selectedUser,
      invitee: formData.get("invitee")?.toString() ?? "",
    } satisfies CreateOnetimeInviteDto;
    const response = await userCreateOnetimeInvite({
      body,
    });
    if (response.data) {
      setInvites([response.data, ...invites]);
      setSelectedUser(null);
    }
  };

  const [users, setUsers] = useState<UserSelectUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  useEffect(() => {
    userList().then((response) => {
      setUsers(response.data ?? []);
    });
  }, []);

  useEffect(() => {
    userGetOnetimeInvites().then((response) => {
      if (response.data) {
        setInvites(
          response.data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      }
    });
  }, []);

  const invitesPerMember = useMemo(() => {
    const map = new Map<
      number,
      { name: string; pfp: string | null; sent: number; accepted: number }
    >();
    for (const invite of invites) {
      const user = invite.invitingUser;
      if (!user) continue;
      const id = user.id;
      const entry = map.get(id) ?? {
        name: user.displayName ?? "Unknown",
        pfp: user.profilePicture ?? null,
        sent: 0,
        accepted: 0,
      };
      entry.sent++;
      if (invite.status === "link_used" || invite.invitedUserId) {
        entry.accepted++;
      }
      map.set(id, entry);
    }
    return [...map.values()].sort((a, b) => b.sent - a.sent);
  }, [invites]);

  const copyToClipboard = (text: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/signup?ref=${text}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-row w-full items-center justify-center pt-36">
      <div className="flex flex-col pb-10 items-stretch mx-2 w-2xl">
        <Card className="flex-1">
          <p className="font-bold">Create an invite</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="invitee"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Invitee
                </label>
                <input
                  type="text"
                  name="invitee"
                  placeholder="preferably a first name capitalized"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <UserSelect
                users={users}
                selectedUserIds={selectedUser ? [selectedUser] : []}
                onChange={(users) => setSelectedUser(users[0])}
                label="Inviting user"
                single={true}
              />
            </div>
            <div className="flex flex-row gap-2 justify-end">
              <Button color={ButtonColor.Black} type="submit">
                Create Invite
              </Button>
            </div>
          </form>
        </Card>
        {invitesPerMember.length > 0 && (
          <details className="mt-5 rounded-lg border border-gray-200 bg-white">
            <summary className="cursor-pointer select-none px-5 py-4 font-semibold">
              Invites per Member
            </summary>
            <div className="px-5 pb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="pb-2 font-semibold">Member</th>
                    <th className="pb-2 text-right font-semibold">Sent</th>
                    <th className="pb-2 text-right font-semibold">Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {invitesPerMember.map((member) => (
                    <tr
                      key={member.name}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="py-2">
                        <div className="flex flex-row gap-2 items-center">
                          <AvatarProfile size="small" pfp={member.pfp} />
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right">{member.sent}</td>
                      <td className="py-2 text-right">{member.accepted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
        <div className="flex flex-row justify-between items-center my-5">
          <p className="font-bold">Past Invites</p>
          <Link
            to="/invites/graph"
            className="text-sm text-blue-600 hover:underline"
          >
            View Invite Graph
          </Link>
        </div>
        <List>
          {invites.map((invite) => (
            <div key={invite.id} className="p-4">
              <div className="flex flex-row gap-2 justify-between items-center">
                <div className="flex flex-row gap-2">
                  <AvatarProfile
                    size="small"
                    pfp={invite.invitingUser?.profilePicture ?? null}
                  />
                  <p>
                    {invite.invitingUser?.displayName}{" "}
                    <span className="text-gray-500"> inviting </span>{" "}
                    {invite.invitedUserId ? (
                      <a
                        href={getBaseUrl() + `/member/${invite.invitedUserId}`}
                        className="underline"
                      >
                        {" "}
                        {invite.invitee}{" "}
                      </a>
                    ) : (
                      invite.invitee
                    )}
                  </p>
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <p className="text-gray-500">{invite.code}</p>
                  {invite.status === "link_unused" ? (
                    <p className="text-green">Active</p>
                  ) : (
                    <p className="text-gray-500">used</p>
                  )}
                  <div
                    className="cursor-pointer active:scale-85 transition-all duration-100"
                    onClick={() => copyToClipboard(invite.code)}
                  >
                    <CopyIcon size="medium" fill="gray" />
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-2 items-center justify-between mt-1">
                <div>
                  {invite.info && (
                    <p className="text-zinc-800 pt-4 text-sm">{invite.info}</p>
                  )}
                </div>
                {invite.createdAt && (
                  <p className="text-zinc-500 text-sm min-w-24">
                    {new Date(invite.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </List>
      </div>
    </div>
  );
};

export default InvitesPage;
