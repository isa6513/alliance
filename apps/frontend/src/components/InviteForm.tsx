import {
  CommunityDto,
  communityGetMyCommunities,
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  userCreateOnetimeInvite,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import CommunityCreateForm from "./CommunityCreateForm";
import DropdownSelect from "@alliance/sharedweb/ui/DropdownSelect";
import { onetimeInviteCreation } from "@alliance/shared/lib/copy";
import { Link } from "react-router";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import ProfileImage from "@alliance/sharedweb/ui/ProfileImage";
import { getMemberCount } from "@alliance/shared/lib/communityUtils";
import OnetimeInviteForm from "./OnetimeInviteForm";

type ResponsibilityChoice = "responsible" | "not_responsible" | null;

type InviteFormProps = {
  onInviteCreated: (invite: OnetimeInviteDto) => void;
};

const InviteForm = ({ onInviteCreated }: InviteFormProps) => {
  const { user } = useAuth();
  const { error: errorToast, success: successToast } = useToast();
  const [responsibilityChoice, setResponsibilityChoice] =
    useState<ResponsibilityChoice>(null);
  const [inviteeName, setInviteeName] = useState("");
  const [info, setInfo] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(
    null
  );
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [communities, setCommunities] = useState<CommunityDto[]>([]);

  const refreshCommunities = useCallback(
    async (resetSelectedCommunityId: boolean) => {
      const response = await communityGetMyCommunities();
      if (response.data) {
        setCommunities(response.data);
        if (resetSelectedCommunityId && user) {
          setSelectedCommunityId(
            response.data.find((community) =>
              community.leaders.some((leader) => leader.id === user.id)
            )?.id ?? null
          );
        }
      }
    },
    [user]
  );
  useEffect(() => {
    void refreshCommunities(true);
  }, [refreshCommunities]);

  const { leaderCommunities, memberCommunities } = useMemo(() => {
    const leaderCommunities: CommunityDto[] = [];
    const memberCommunities: CommunityDto[] = [];
    if (!user) {
      return { leaderCommunities, memberCommunities };
    }
    for (const community of communities) {
      if (community.leaders?.some((leader) => leader.id === user.id)) {
        leaderCommunities.push(community);
      } else {
        memberCommunities.push(community);
      }
    }
    return { leaderCommunities, memberCommunities };
  }, [communities, user]);

  const isLeader = leaderCommunities.length > 0;

  useEffect(() => {
    if (isLeader) {
      setResponsibilityChoice("responsible");
    }
  }, [isLeader]);

  const leaderCommunitiesById = useMemo(() => {
    return new Map(
      leaderCommunities.map((community) => [community.id, community])
    );
  }, [leaderCommunities]);
  const selectedCommunity = useMemo(() => {
    return leaderCommunitiesById.get(selectedCommunityId as number) ?? null;
  }, [leaderCommunitiesById, selectedCommunityId]);

  const communityOptions = useMemo<Record<`c${number}` | "new", string>>(
    () => ({
      ...Object.fromEntries(
        leaderCommunities.map((community) => [
          `c${community.id}`,
          community.name,
        ])
      ),
      new: "Create a new group",
    }),
    [leaderCommunities]
  );

  const handleCreateInvite = useCallback(
    async (communityId: number | null) => {
      if (!inviteeName.trim()) {
        errorToast("Please enter the invitee's name");
        return;
      }

      if (responsibilityChoice === "responsible") {
        if (communityId === null) {
          errorToast("Please select a group");
          return;
        }
      }

      setCreatingInvite(true);
      try {
        const body: CreateOnetimeInviteDto = {
          invitee: inviteeName.trim(),
          ...(info.trim() && { info: info.trim() }),
          ...(responsibilityChoice === "responsible" &&
            communityId !== null && {
              communityId,
            }),
        };

        const response = await userCreateOnetimeInvite({ body });
        if (response.data) {
          successToast("Invite created successfully!");
          setInviteeName("");
          setInfo("");
          onInviteCreated(response.data);
        } else {
          errorToast(
            `Failed to create invite: ${
              response.response?.statusText || "Unknown error"
            }`
          );
        }
      } catch {
        errorToast("Failed to create invite");
      } finally {
        setCreatingInvite(false);
      }
    },
    [
      inviteeName,
      info,
      responsibilityChoice,
      errorToast,
      successToast,
      onInviteCreated,
    ]
  );

  const onCreateCommunity = useCallback(
    async (community: CommunityDto) => {
      try {
        await handleCreateInvite(community.id);
        await refreshCommunities(false);
        setSelectedCommunityId(community.id);
      } catch {
        errorToast("Failed to refresh groups");
      }
    },
    [errorToast, refreshCommunities, handleCreateInvite]
  );

  const {
    memberCommunityAllowsMemberInvites,
    memberCommunityRemainingCapacity,
  } =
    !memberCommunities.length ||
    !memberCommunities[0].allowMemberInvites ||
    memberCommunities[0].maxCapacity === null
      ? {
          memberCommunityAllowsMemberInvites: false,
          memberCommunityRemainingCapacity: 0,
        }
      : {
          memberCommunityAllowsMemberInvites: true,
          memberCommunityRemainingCapacity:
            memberCommunities[0].maxCapacity -
            getMemberCount(memberCommunities[0]),
        };

  return (
    <Card style={CardStyle.Grey}>
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <p className="font-semibold text-xl">
              {onetimeInviteCreation.title}
            </p>
            <AppMarkdownWrapper
              className="text-zinc-500"
              markdownContent={onetimeInviteCreation.explanation.join("\n\n")}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              color={ButtonColor.Green}
              onClick={() => setResponsibilityChoice("responsible")}
              disabled={responsibilityChoice === "responsible"}
              className="w-full"
            >
              {onetimeInviteCreation.responsible.buttonText}
            </Button>
            <Button
              color={ButtonColor.Grey}
              onClick={() => setResponsibilityChoice("not_responsible")}
              disabled={responsibilityChoice === "not_responsible"}
              className="w-full"
            >
              {onetimeInviteCreation.not_responsible.buttonText}
            </Button>
          </div>
        </div>

        {responsibilityChoice === "not_responsible" && (
          <div className="flex flex-col gap-y-4 border-t border-zinc-200 pt-4">
            <div className="flex flex-col gap-y-2">
              <p className="font-semibold text-xl">
                {onetimeInviteCreation.not_responsible.title}
              </p>
              {!memberCommunityAllowsMemberInvites ? (
                <div className="text-zinc-500">
                  <AppMarkdownWrapper
                    markdownContent={onetimeInviteCreation.not_responsible.explanations.genericGroup.join(
                      "\n\n"
                    )}
                  />
                </div>
              ) : memberCommunityRemainingCapacity > 0 ? (
                <>
                  <div className="text-zinc-500">
                    <AppMarkdownWrapper
                      markdownContent={onetimeInviteCreation.not_responsible.explanations.yourGroup.join(
                        "\n\n"
                      )}
                    />
                  </div>
                  <Link
                    to={`/groups?communityId=${memberCommunities[0].id}`}
                    onClick={(e) => e.stopPropagation()}
                    key="your-current-group"
                    className="mt-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded px-3 py-2 flex flex-col gap-y-2 self-start"
                  >
                    <p className="text-sm text-zinc-500">Your current group</p>
                    <div className="flex flex-row justify-between items-center gap-x-1.5">
                      <ProfileImage
                        pfp={memberCommunities[0].photo ?? null}
                        size="small"
                      />
                      <div className="flex flex-row gap-2">
                        <p className="font-semibold">
                          {memberCommunities[0].name}
                        </p>
                        <p className="text-zinc-500">
                          {`${memberCommunityRemainingCapacity} open seat${
                            memberCommunityRemainingCapacity === 1 ? "" : "s"
                          }`}
                        </p>
                      </div>
                    </div>
                  </Link>
                </>
              ) : (
                <div className="text-zinc-500">
                  <AppMarkdownWrapper
                    markdownContent={onetimeInviteCreation.not_responsible.explanations.yourGroupNoCapacity.join(
                      "\n\n"
                    )}
                  />
                </div>
              )}
            </div>
            <OnetimeInviteForm
              inviteeName={inviteeName}
              setInviteeName={setInviteeName}
              info={info}
              setInfo={setInfo}
              onSubmit={() => handleCreateInvite(null)}
              creatingInvite={creatingInvite}
              submittingText="Creating..."
            />
          </div>
        )}

        {responsibilityChoice === "responsible" && (
          <>
            {/* Invitee name input */}
            <div className="border-t border-zinc-200 pt-4">
              <OnetimeInviteForm
                title={onetimeInviteCreation.responsible.leader.invite.title}
                explanation={
                  onetimeInviteCreation.responsible.leader.invite.explanation
                }
                inviteeName={inviteeName}
                setInviteeName={setInviteeName}
                info={info}
                setInfo={setInfo}
              />
            </div>

            {isLeader && (
              <div className="flex flex-col gap-y-4 border-t border-zinc-200 pt-4">
                {/* Group selection */}
                <p className="text-xl font-semibold">
                  {onetimeInviteCreation.responsible.leader.title}
                </p>
                <DropdownSelect
                  options={communityOptions}
                  value={selectedCommunity?.name ?? communityOptions["new"]}
                  onChange={([key]) => {
                    if (key === "new") {
                      setSelectedCommunityId(null);
                    } else {
                      setSelectedCommunityId(Number(key.slice(1)));
                    }
                  }}
                  titleOverride={
                    selectedCommunityId &&
                    typeof selectedCommunityId === "number"
                      ? selectedCommunity?.name || "Select a group"
                      : selectedCommunityId === null
                      ? "Create a new group"
                      : "Select a group"
                  }
                />
                {!!selectedCommunity && (
                  <Button
                    color={ButtonColor.Black}
                    onClick={() => handleCreateInvite(selectedCommunityId)}
                    disabled={
                      creatingInvite ||
                      !inviteeName.trim() ||
                      selectedCommunityId === null
                    }
                    className="w-full"
                  >
                    {creatingInvite ? "Creating invite..." : "Create invite"}
                  </Button>
                )}
              </div>
            )}

            {!selectedCommunity && (
              <div className="flex flex-col gap-y-4 border-t border-zinc-200 pt-4">
                {/* Group creation */}
                <div className="flex flex-col gap-y-2">
                  <p className="text-xl font-semibold">
                    {onetimeInviteCreation.responsible.leader.newGroup.title}
                  </p>
                  {!isLeader && (
                    <p className="text-zinc-500">
                      You do not lead a group yet. You must create a group to be
                      responsible for the new member.
                    </p>
                  )}
                  <p className="text-zinc-500">
                    You can learn more about groups on our{" "}
                    <Link
                      to={"/groups-guide"}
                      className="text-green hover:underline"
                    >
                      groups guide
                    </Link>
                    .
                  </p>
                </div>
                <CommunityCreateForm
                  name={user?.name}
                  createButtonTextOverride={
                    creatingInvite
                      ? "Creating invite..."
                      : onetimeInviteCreation.responsible.leader.newGroup
                          .createButtonText
                  }
                  createDisabled={creatingInvite || !inviteeName.trim()}
                  onSuccess={onCreateCommunity}
                  includePhotoEditor={false}
                  fullWidthButtons={true}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default InviteForm;
