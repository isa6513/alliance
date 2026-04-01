import {
  CommunityDto,
  communityGetMyCommunities,
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  userCreateOnetimeInvite,
} from "@alliance/shared/client";
import NewButton, { ButtonColor } from "@alliance/sharedweb/ui/NewButton";
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
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import { getMemberCount } from "@alliance/shared/lib/communityUtils";
import OnetimeInviteForm from "./OnetimeInviteForm";

const inviteTitleClass = "font-semibold text-xl text-zinc-900";
const inviteSectionLabelClass = "text-lg font-semibold text-zinc-900";
const inviteStrongClass = "text-base font-semibold text-zinc-900";

type PlacementSelection =
  | { kind: "community"; id: number }
  | { kind: "assign" }
  | { kind: "new" };

type InviteFormProps = {
  onInviteCreated: (invite: OnetimeInviteDto) => void;
};

const InviteForm = ({ onInviteCreated }: InviteFormProps) => {
  const { user } = useAuth();
  const { error: errorToast, success: successToast } = useToast();
  const [placement, setPlacement] = useState<PlacementSelection>({
    kind: "new",
  });
  const [inviteeName, setInviteeName] = useState("");
  const [info, setInfo] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [communities, setCommunities] = useState<CommunityDto[]>([]);

  const refreshCommunities = useCallback(
    async (resetSelectedCommunityId: boolean) => {
      const response = await communityGetMyCommunities();
      if (response.data) {
        setCommunities(response.data);
        if (resetSelectedCommunityId && user) {
          const led = response.data.find((community) =>
            community.leaders.some((leader) => leader.id === user.id),
          );
          setPlacement(
            led ? { kind: "community", id: led.id } : { kind: "new" },
          );
        }
      }
    },
    [user],
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

  const leaderCommunitiesById = useMemo(() => {
    return new Map(
      leaderCommunities.map((community) => [community.id, community]),
    );
  }, [leaderCommunities]);
  const selectedCommunity = useMemo(() => {
    if (placement.kind !== "community") {
      return null;
    }
    return leaderCommunitiesById.get(placement.id) ?? null;
  }, [leaderCommunitiesById, placement]);

  const communityOptions = useMemo(() => {
    return {
      ...Object.fromEntries(
        leaderCommunities.map((community) => [
          `c${community.id}`,
          community.name,
        ]),
      ),
      assign: onetimeInviteCreation.assignToOpenGroup,
      new: onetimeInviteCreation.createNewGroupOption,
    } as Record<string, string>;
  }, [leaderCommunities]);

  const dropdownSelectedLabel = useMemo(() => {
    if (placement.kind === "assign") {
      return communityOptions.assign;
    }
    if (placement.kind === "new") {
      return communityOptions.new;
    }
    return (
      communityOptions[`c${placement.id}`] ??
      onetimeInviteCreation.createNewGroupOption
    );
  }, [placement, communityOptions]);

  useEffect(() => {
    if (
      placement.kind === "community" &&
      !leaderCommunitiesById.has(placement.id)
    ) {
      setPlacement(
        leaderCommunities[0]
          ? { kind: "community", id: leaderCommunities[0].id }
          : { kind: "new" },
      );
    }
  }, [placement, leaderCommunities, leaderCommunitiesById]);

  const handleCreateInvite = useCallback(
    async (communityId: number | null) => {
      if (!inviteeName.trim()) {
        errorToast("Please enter the invitee's name");
        return;
      }

      setCreatingInvite(true);
      try {
        const body: CreateOnetimeInviteDto = {
          invitee: inviteeName.trim(),
          ...(info.trim() && { info: info.trim() }),
          ...(communityId !== null && { communityId }),
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
            }`,
          );
        }
      } catch {
        errorToast("Failed to create invite");
      } finally {
        setCreatingInvite(false);
      }
    },
    [inviteeName, info, errorToast, successToast, onInviteCreated],
  );

  const onCreateCommunity = useCallback(
    async (community: CommunityDto) => {
      try {
        await handleCreateInvite(community.id);
        await refreshCommunities(false);
        setPlacement({ kind: "community", id: community.id });
      } catch {
        errorToast("Failed to refresh groups");
      }
    },
    [errorToast, refreshCommunities, handleCreateInvite],
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
    <Card style={CardStyle.White} className="p-6">
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-4">
          <p className={inviteTitleClass}>{onetimeInviteCreation.title}</p>
          <AppMarkdownWrapper
            className="text-invite-form-body"
            markdownContent={onetimeInviteCreation.explanation.join("\n\n")}
          />
          <OnetimeInviteForm
            inviteeName={inviteeName}
            setInviteeName={setInviteeName}
            info={info}
            setInfo={setInfo}
          />
        </div>

        <div className="flex flex-col gap-y-4">
          <p className={inviteSectionLabelClass}>
            {onetimeInviteCreation.responsible.leader.title}
          </p>
          <p className="text-invite-form-body">
            {onetimeInviteCreation.groupContext}
          </p>
          <DropdownSelect
            options={communityOptions}
            value={dropdownSelectedLabel}
            onChange={([key]) => {
              const k = String(key);
              if (k === "assign") {
                setPlacement({ kind: "assign" });
              } else if (k === "new") {
                setPlacement({ kind: "new" });
              } else if (k.startsWith("c")) {
                setPlacement({ kind: "community", id: Number(k.slice(1)) });
              }
            }}
            titleOverride={dropdownSelectedLabel}
            dropdownWidth="medium"
          />
        </div>

        {placement.kind === "assign" && (
          <div className="flex flex-col gap-y-4">
            {!memberCommunityAllowsMemberInvites ? (
              <AppMarkdownWrapper
                className="text-invite-form-body"
                markdownContent={onetimeInviteCreation.not_responsible.explanations.genericGroup.join(
                  "\n\n",
                )}
              />
            ) : memberCommunityRemainingCapacity > 0 ? (
              <>
                <AppMarkdownWrapper
                  className="text-invite-form-body"
                  markdownContent={onetimeInviteCreation.not_responsible.explanations.yourGroup.join(
                    "\n\n",
                  )}
                />
                <Link
                  to={`/groups?communityId=${memberCommunities[0].id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="border border-zinc-200 bg-white hover:bg-zinc-50 rounded px-3 py-2.5 flex flex-col gap-y-2 self-start max-w-full"
                >
                  <p className={inviteSectionLabelClass}>Your current group</p>
                  <div className="flex flex-row items-center gap-x-2 min-w-0">
                    <AvatarProfile
                      pfp={memberCommunities[0].photo ?? null}
                      size="small"
                    />
                    <div className="flex flex-col min-w-0 sm:flex-row sm:items-baseline sm:gap-x-2">
                      <p className={`${inviteStrongClass} truncate`}>
                        {memberCommunities[0].name}
                      </p>
                      <p className="text-invite-form-body shrink-0">
                        {`${memberCommunityRemainingCapacity} open seat${
                          memberCommunityRemainingCapacity === 1 ? "" : "s"
                        }`}
                      </p>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <AppMarkdownWrapper
                className="text-invite-form-body"
                markdownContent={onetimeInviteCreation.not_responsible.explanations.yourGroupNoCapacity.join(
                  "\n\n",
                )}
              />
            )}
            <NewButton
              color={ButtonColor.Black}
              onClick={() => handleCreateInvite(null)}
              disabled={creatingInvite || !inviteeName.trim()}
              className="w-full"
            >
              {creatingInvite ? "Creating..." : "Create invite"}
            </NewButton>
          </div>
        )}

        {placement.kind === "new" && (
          <div className="flex flex-col gap-y-4">
            <AppMarkdownWrapper
              className="text-invite-form-body"
              markdownContent={onetimeInviteCreation.responsible.leader.invite.explanation.join(
                "\n\n",
              )}
            />
            <p className={inviteSectionLabelClass}>
              {onetimeInviteCreation.responsible.leader.newGroup.title}
            </p>
            {!isLeader && (
              <p className="text-invite-form-body">
                You are not leading a group yet—create one to be responsible for
                this member.
              </p>
            )}
            <p className="text-invite-form-body">
              Read our{" "}
              <Link to="/groups-guide" className="text-green hover:underline">
                groups guide
              </Link>{" "}
              to learn how to lead a group.
            </p>
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

        {placement.kind === "community" && selectedCommunity && (
          <div className="flex flex-col gap-y-4">
            <AppMarkdownWrapper
              className="text-invite-form-body"
              markdownContent={onetimeInviteCreation.responsible.leader.invite.explanation.join(
                "\n\n",
              )}
            />
            <NewButton
              color={ButtonColor.Black}
              onClick={() => handleCreateInvite(placement.id)}
              disabled={creatingInvite || !inviteeName.trim()}
              className="w-full"
            >
              {creatingInvite ? "Creating invite..." : "Create invite"}
            </NewButton>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InviteForm;
