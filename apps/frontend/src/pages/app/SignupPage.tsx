import {
  authMe,
  authRegister,
  ProfileDto,
  SignUpDto,
  userOnetimeInvite,
  userReferrerProfile,
} from "@alliance/shared/client";
import { Features } from "@alliance/shared/lib/features";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import posthog from "posthog-js";
import React, { useEffect, useState } from "react";
import { Link, href, useSearchParams } from "react-router";
import SignupForm from "../../components/SignupForm";
import { isFeatureEnabled } from "../../lib/config";
import ProfileImage from "@alliance/shared/ui/ProfileImage";

const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const referralCode = searchParams.get("ref");

  const [inviterProfile, setInviterProfile] = useState<ProfileDto | null>(null);
  const [inviteeName, setInviteeName] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<number | null>(null);

  useEffect(() => {
    if (!referralCode) return;
    userReferrerProfile({ path: { code: referralCode } }).then((response) => {
      setInviterProfile(response.data ?? null);
    });

    userOnetimeInvite({ path: { code: referralCode } }).then((response) => {
      console.log(response);
      if (response.data) {
        setInviteeName(response.data.invitee);
        setCommunityId(response.data.community?.id ?? null);
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
          const user = checkAuth.data;
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
        <div className="flex flex-col flex-grow items-center justify-center ">
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
    <div className="min-h-screen flex flex-col bg-page">
      <div className="flex flex-col md:flex-row gap-x-16 lg:gap-x-24 xl:gap-x-32 gap-y-12 py-12 items-center my-auto mx-auto px-4">
        <div className="flex flex-col w-full md:w-lg items-center justify-center">
          <div className="w-full">
            <h2 className="font-serif !text-3xl text-center mb-8">
              Create an account
            </h2>

            {error && (
              <Card
                style={CardStyle.Alert}
                className="border-red-400 bg-red-50 mb-6"
              >
                <span className="text-red-700">{error}</span>
              </Card>
            )}

            <Card className="p-4 md:p-8 relative" style={CardStyle.White}>
              <SignupForm
                onSubmit={handleSubmit}
                loading={loading}
                referralCode={referralCode}
              />
            </Card>
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
        {referralCode && (
          <div className="flex flex-col gap-y-6 max-w-lg border md:border-none border-zinc-200 p-4 md:p-0 rounded">
            <div className="flex flex-col gap-y-2 mb-4">
              <div className="flex flex-row gap-x-1 items-center">
                <span>From </span>
                <ProfileImage
                  pfp={inviterProfile?.profilePicture ?? null}
                  size="small"
                  className="ml-1 inline-block text-green"
                />
                <span className="font-medium">
                  {inviterProfile?.displayName}
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                You will be added as friends
                {communityId ? ` and join their group` : ""} automatically.
              </p>
            </div>
            <p className="flex flex-row flex-wrap gap-x-1 items-center">
              Hi {inviteeName},
            </p>
            <p>
              I invite you to join the Alliance, a group of individuals
              coordinating to solve the world&apos;s largest problems.
            </p>
            <p>
              <span className="font-bold">Our model is effective.</span> Members
              make a commitment to complete tasks on time. Since we can trust
              one another to show up, we can execute concrete, effective action
              plans.
            </p>
            <p>
              <span className="font-bold">
                Participation is straightforward.
              </span>{" "}
              Tasks only require 15 minutes per week. Each task is broken down
              into simple steps.
            </p>
            <p>
              <span className="font-bold">
                We have the potential to become a major global force.
              </span>{" "}
              Right now, we&apos;re running small experiments to test our model
              and strategies. One day, we could have enormous collective power:
              for instance, we could call on millions of members to boycott a
              corporation acting unethically, simultaneously make lifestyle
              changes to curtail waste, or fund new scientific research
              neglected by governments and markets.
            </p>
            <p>
              You can read more about how we work in our{" "}
              <Link to={"/guide"} className="text-green hover:underline">
                guide
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
