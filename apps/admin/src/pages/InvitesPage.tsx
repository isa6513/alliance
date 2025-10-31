import {
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  userCreateOnetimeInvite,
  userGetOnetimeInvites,
  userList,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";
import { useEffect, useState } from "react";
import UserSelect, { UserSelectUser } from "../components/UserSelect";
import List from "@alliance/shared/ui/List";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import CopyIcon from "@alliance/shared/ui/icons/CopyIcon";

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
      setInvites([...invites, response.data]);
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
      setInvites(response.data ?? []);
    });
  }, []);

  const copyToClipboard = (text: string) => {
    const url = `https://worldalliance.org/invite?ref=${text}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-row w-full items-center justify-center pt-36">
      <div className="flex flex-col">
        <Card className="w-200">
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
        <p className="font-bold my-5">Past Invites</p>
        <List>
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex flex-row gap-2 p-4 justify-between items-center"
            >
              <div className="flex flex-row gap-2">
                <ProfileImage
                  size="small"
                  pfp={invite.invitingUser.profilePicture}
                />
                <p>
                  {invite.invitingUser.name}{" "}
                  <span className="text-gray-500"> inviting </span>{" "}
                  {invite.invitee}
                </p>
              </div>
              <div className="flex flex-row gap-3 items-center">
                <p className="text-gray-500">{invite.code}</p>
                {invite.isValid ? (
                  <p className="text-green">Active</p>
                ) : (
                  <p className="text-gray-500">used</p>
                )}
                <div
                  className="cursor-pointer active:scale-85 transition-all duration-100"
                  onClick={() => copyToClipboard(invite.code)}
                >
                  <CopyIcon size="large" fill="gray" />
                </div>
              </div>
            </div>
          ))}
        </List>
      </div>
    </div>
  );
};

export default InvitesPage;
