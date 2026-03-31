import {
  authMe,
  authRegister,
  ProfileDto,
  SignUpDto,
  userNmembers,
  userOnetimeInvite,
  userReferrerProfile,
} from "@alliance/shared/client";
import { Features } from "@alliance/shared/lib/features";
import Card from "@alliance/sharedweb/ui/Card";
import posthog from "posthog-js";
import React, { useEffect, useState } from "react";
import { Link, href, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import SignupForm from "../../components/SignupForm";
import { isFeatureEnabled } from "../../lib/config";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";

import { CardStyle } from "@alliance/shared/styles/card";
import ExampleActionCardList from "../../components/ExampleActionCardList";
import { ChevronRight } from "lucide-react";

const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const referralCode = searchParams.get("ref");

  const { data: memberCount, isPending: memberCountPending } = useQuery({
    queryKey: ["userNmembers"],
    queryFn: () => userNmembers().then((res) => res.data ?? 0),
    enabled: isFeatureEnabled(Features.PublicSignup) || Boolean(referralCode),
  });

  const [inviterProfile, setInviterProfile] = useState<ProfileDto | null>(null);
  // const [inviteeName, setInviteeName] = useState<string | null>(null);
  // const [communityId, setCommunityId] = useState<number | null>(null);
  const [isInviteValid, setIsInviteValid] = useState(true);

  useEffect(() => {
    if (!referralCode) return;
    userReferrerProfile({ path: { code: referralCode } }).then((response) => {
      setInviterProfile(response.data ?? null);
    });

    userOnetimeInvite({ path: { code: referralCode } }).then((response) => {
      if (response.data) {
        // setInviteeName(response.data.invitee);
        // setCommunityId(response.data.community?.id ?? null);
        setIsInviteValid(response.data.status !== "link_used");
      }
    });

    posthog.register_once({
      referral_code: referralCode,
    });
    posthog.capture("invite_page_opened", {
      referral_code: referralCode,
    });
  }, [referralCode]);

  const handleSubmit = async (formData: SignUpDto) => {
    setError(null);
    setLoading(true);

    try {
      const resp = await authRegister({ body: formData });
      if (resp.response.ok) {
        const checkAuth = await authMe();

        if (checkAuth.response.ok) {
          const user = checkAuth.data?.user;
          if (user) {
            posthog.identify(user.id.toString(), {
              email: user.email,
              name: user.name,
              referral_code: referralCode,
            });
            posthog.capture("new_user", {
              email: user.email,
              name: user.name,
              referral_code: referralCode,
            });
          }
          window.location.href = href("/tasks");
        } else {
          setError("please try again");
        }
      } else {
        setError((resp.error as Error).message || "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isFeatureEnabled(Features.PublicSignup) && !referralCode) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <div className="flex flex-col grow items-center justify-center ">
          <div className="w-full max-w-md px-8">
            <p className="font-bold !mb-2">
              The Alliance is currently invite-only.
            </p>
            <p>If you received an invite link, please use it to sign up.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left: create account */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-lg">
          {isInviteValid && inviterProfile && (
            <div className="mb-3 rounded-md">
              <div className="flex flex-row gap-x-1 items-center text-zinc-500">
                <span>Invited by </span>
                <AvatarProfile
                  pfp={inviterProfile?.profilePicture ?? null}
                  size="small"
                  className="ml-1 inline-block text-green"
                />
                <span className="font-medium">
                  {inviterProfile?.displayName}
                </span>
              </div>
            </div>
          )}

          {error && (
            <Card
              style={CardStyle.Alert}
              className="border-red-400 bg-red-50 mb-6"
            >
              <span className="text-red-700">{error}</span>
            </Card>
          )}

          <div className="relative">
            {isInviteValid ? (
              <>
                <h2 className="font-medium text-3xl mb-8">Create an account</h2>
                <SignupForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  referralCode={referralCode}
                />
              </>
            ) : (
              <div className="p-4 md:p-8 space-y-4 flex flex-col">
                <p className="font-semibold">
                  You were sent an invite that has already been used.
                </p>
                <p>
                  If you haven&apos;t created an account yet, please reach out
                  to whoever invited you for a new invite code.
                </p>
                <p>
                  If you already have an account, please{" "}
                  <Link to={href("/login")} className="text-link">
                    log in
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>

          {!referralCode && (
            <div className="mt-6 text-center">
              <p className="text-[11pt] text-zinc-600">
                Already have an account?{" "}
                <Link
                  to={href("/login")}
                  className="text-green hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: info */}
      <div className="w-full md:w-1/2 bg-grey-0 border-l border-grey-1 flex items-center justify-center px-4 sm:px-12 lg:px-24 xl:px-32 py-12">
        <div className="w-full">
          <h2 className="text-title-medium mb-4">Join the Alliance</h2>
          <p className="text-lg text-zinc-600 mb-6">
            We&apos;re a global group of{" "}
            <span className="font-medium text-black">
              {memberCountPending ? "…" : (memberCount ?? 0)} people
            </span>{" "}
            cooperating to improve the world. We leverage dependable time
            commitments from members to plan effective actions.
          </p>

          <div className="w-full flex flex-col gap-y-4">
            <div>
              <Link
                to={href("/guide")}
                className="font-medium text-lg hover:underline flex flex-row items-center gap-x-2"
              >
                Read our guide <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-base">
              <Link
                to={href("/progress")}
                className="font-medium text-lg mb-4 hover:underline flex flex-row items-center gap-x-2"
              >
                Examples of actions
                <ChevronRight className="w-4 h-4" />
              </Link>

              <ExampleActionCardList bgColor="white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
