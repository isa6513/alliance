import { authMe, authRegister, SignUpDto } from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import posthog from "posthog-js";
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
import SignupForm from "../../components/SignupForm";

const InvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const referralCode = searchParams.get("ref");

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
            });
            posthog.capture("new_user", {
              email: user.email,
              name: user.name,
            });
          }
          window.location.href = "/tasks";
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

  if (!referralCode) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <div className="flex flex-col flex-grow items-center justify-center ">
          <div className="w-full text-xl text-center max-w-md px-8">
            <p>Invalid invite</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <div className="flex flex-col flex-grow items-center justify-center ">
        <div className="w-full max-w-4xl px-8 py-24">
          <h2 className="font-serif !text-4xl text-center mb-8">
            Invitation to the Alliance
          </h2>

          {error && (
            <Card
              style={CardStyle.Alert}
              className="border-red-400 bg-red-50 mb-6"
            >
              <span className="text-red-700">{error}</span>
            </Card>
          )}

          <Card className="p-12 flex flex-col gap-y-6" style={CardStyle.White}>
            <p>
              Hi friend, I hope you will join me as a member of the Alliance. I
              believe you share my concerns about the direction that the world
              is headed, and I think the Alliance is an opportunity to make a
              significant difference.
            </p>

            <h3 className="font-serif !text-3xl font-bold">Why join?</h3>

            <p>
              <span className="font-bold">
                We’re a global group of individuals
              </span>{" "}
              learning to coordinate to advance humanity’s interests. We plan to
              fight extreme poverty, environmental destruction, breakdown of
              democratic institutions, and dangerous technological development.
            </p>
            <p>
              <span className="font-bold">Our unique model</span> could one day
              enable sustained, strategic cooperation among millions of people:
              <ol className="list-decimal list-inside my-2 space-y-1">
                <li>
                  Members commit to give a reliable fraction of their time.
                  Right now, this is 15 minutes per week.
                </li>
                <li>
                  In return, our staff team prepares a steady stream of
                  high-impact actions for members to complete following a
                  democratic assessment of priorities.
                </li>
              </ol>
              <span className="font-bold">Imagine if millions of people</span>{" "}
              could instantly boycott a corporation acting unethically, or
              collectively make lifestyle changes to curtail waste, or fund new
              scientific research neglected by governments and markets. This is
              the kind of flexible power we hope to build together.
            </p>
            <p>
              <span className="font-bold">
                This is an important time to join.
              </span>{" "}
              If we one day accomplish great things, it will be because our
              friends and family were willing to step up before success was
              guaranteed. Also, since we are still small and experimental, you
              could have an outsized influence on our approach and culture.
            </p>

            <h3 className="font-serif !text-3xl font-bold">
              What do you need?
            </h3>
            <p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  <span className="font-bold">
                    A willingness to take our world's problems seriously.
                  </span>{" "}
                  We need a shared belief that these problems are not right, and
                  therefore a readiness to take actions that require meaningful
                  effort. Given this, we can address disagreements with respect
                  and reasoned deliberation.
                </li>
                <li>
                  <span className="font-bold">
                    A willingness to make and keep a promise.
                  </span>{" "}
                  If we can trust every member follows through on their word, we
                  can make ambitious plans that rely on one another.
                </li>
              </ol>
            </p>
            <h3 className="font-serif !text-3xl font-bold">How do you join?</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <span className="font-bold">
                  Skim our{" "}
                  <Link to="/guide" className="text-link" target="_blank">
                    Guide
                  </Link>
                </span>{" "}
                to understand our structure, process, and governance.
              </li>
              <li>
                <span className="font-bold">
                  Create an account with my{" "}
                  <Link
                    to={`/signup?ref=${referralCode}`}
                    className="text-link"
                    target="_blank"
                  >
                    custom invite link here
                  </Link>
                </span>
                . We will automatically be added as friends.
              </li>
              <li>
                <span className="font-bold">
                  Go through the onboarding tasks on your{" "}
                  <Link to="/tasks" className="text-link" target="_blank">
                    Tasks page
                  </Link>
                  .
                </span>{" "}
                Please let me know if you have any questions!
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
