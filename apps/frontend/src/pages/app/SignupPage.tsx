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
import CompletedBar from "@alliance/sharedweb/ui/CompletedBar";
import { CardStyle } from "@alliance/shared/styles/card";
import { completedBarPercentage } from "@alliance/shared/lib/utils";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import Footer from "../../components/Footer";

const MEMBER_GOAL = 150;

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
  const [inviteeName, setInviteeName] = useState<string | null>(null);
  // const [communityId, setCommunityId] = useState<number | null>(null);
  const [isInviteValid, setIsInviteValid] = useState(true);

  useEffect(() => {
    if (!referralCode) return;
    userReferrerProfile({ path: { code: referralCode } }).then((response) => {
      setInviterProfile(response.data ?? null);
    });

    userOnetimeInvite({ path: { code: referralCode } }).then((response) => {
      if (response.data) {
        setInviteeName(response.data.invitee);
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
            <p>If you recieved an invite link, please use it to sign up.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex flex-col md:flex-row gap-x-16 lg:gap-x-24 xl:gap-x-32 gap-y-12 py-12 items-center my-auto mx-auto px-4">
        <div className="flex flex-col w-full md:w-lg items-center justify-center">
          <div className="w-full">
            {isInviteValid && (
              <>
                {inviterProfile && (
                  <div className="mb-6  rounded-md">
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
                <h2 className="text-title mb-2">Join the Alliance</h2>
                <p className="text-lg text-zinc-900 mb-6">
                  We&apos;re a global group of people cooperating to improve the
                  world.
                </p>

                <div className="mb-12 w-full flex flex-col gap-y-1">
                  <div className="flex flex-row justify-between items-end">
                    <p className="text-base text-zinc-500 text-center">
                      Help us reach{" "}
                      <span className="font-semibold text-black">
                        {MEMBER_GOAL}
                      </span>{" "}
                      members
                    </p>
                    <p className="text-base text-zinc-500 whitespace-nowrap">
                      {memberCountPending ? "…" : (memberCount ?? 0)} /{" "}
                      {MEMBER_GOAL}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between w-full">
                    <CompletedBar
                      percentage={completedBarPercentage(
                        memberCount ?? 0,
                        MEMBER_GOAL,
                      )}
                      height="h-5"
                    />
                  </div>
                </div>
              </>
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
        {/* {referralCode && (
          <div className="flex flex-col gap-y-6 max-w-lg p-4 md:p-0">
            <p>Why join the Alliance?</p>
            <ol className="list-decimal list-inside space-y-3 pl-2">
              <li>
                <span className="font-semibold">
                  Our actions are effective.
                </span>{" "}
                Members of the Alliance commit to complete tasks on time. As a
                result of this trust, we are able to execute complex, precise
                plans.
              </li>
              <li>
                <span className="font-semibold">
                  Participation is straightforward.
                </span>{" "}
                Tasks take 15 minutes per week and have tangible results. For
                example, our{" "}
                <Link
                  to={href("/actions/:id", { id: "14" })}
                  className="text-link"
                >
                  bring your own cup campaign
                </Link>{" "}
                and an{" "}
                <Link
                  to={href("/actions/:id", { id: "56" })}
                  className="text-link"
                >
                  AI privacy survey
                </Link>{" "}
                we ran both made the news.
              </li>
              <li>
                <span className="font-semibold">
                  We are growing carefully and deliberately.
                </span>{" "}
                Right now, we’re running small experiments in order to test our
                structures and processes. One day, millions of members could
                take large-scale action to reduce poverty, restore the
                environment, and more.
              </li>
            </ol>
            <p>
              Our{" "}
              <Link to={href("/guide")} className="text-link">
                guide
              </Link>{" "}
              goes into more detail about our structure and priorities, and
              gives some examples of past actions.
            </p>
          </div>
        )} */}
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;
