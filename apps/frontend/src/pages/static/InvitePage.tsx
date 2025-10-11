import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React from "react";
import { Link, useSearchParams } from "react-router";

const InvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const referralCode = searchParams.get("ref");

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
        <div className="w-full max-w-4xl px-4 md:px-8 py-12 md:py-24">
          <h2 className="font-serif !text-4xl text-center mb-8 mx-4">
            Invitation to the Alliance
          </h2>

          <Card
            className="p-4 md:p-12 flex flex-col gap-y-6"
            style={CardStyle.White}
          >
            <p>
              Hi friend, I hope you will join me as a member of the Alliance. I
              believe you to share my concerns about the direction that the
              world is headed, and I think this is an opportunity to make a
              significant difference.
            </p>

            <h3 className="font-serif !text-3xl font-bold mt-2">Why join?</h3>

            <p>
              <span className="font-bold">
                We’re a global group of individuals
              </span>{" "}
              learning to coordinate to advance humanity’s interests. We plan to
              fight extreme poverty, environmental destruction, the breakdown of
              democratic institutions, and dangerous technological development.
            </p>
            <p>
              <span className="font-bold">Our unique model</span> could one day
              enable sustained, strategic cooperation among millions of people:
            </p>
            <ol className="list-decimal list-inside space-y-3 ">
              <li>
                Members commit to give a reliable fraction of their time. Right
                now, this is 15 minutes per week.
              </li>
              <li>
                A strategic office prepares high-impact collective actions
                following a democratic assessment of priorities.
              </li>
            </ol>
            <p>
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

            <h3 className="font-serif !text-3xl font-bold mt-2">
              What do you need?
            </h3>
            <p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-bold">
                    A willingness to take our world&apos;s problems seriously.
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
                  can make ambitious and complex plans that rely on one another.
                </li>
              </ol>
            </p>
            <h3 className="font-serif !text-3xl font-bold mt-2">
              How do you join?
            </h3>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Skim our
                <Link to="/guide" target="_blank">
                  <div className="inline-block py-0.5 px-2 mx-2 border border-green hover:bg-zinc-50 rounded-md font-medium shadow mx-1 text-green">
                    guide
                  </div>
                </Link>
                to understand our structure, process, and governance.
              </li>
              <li>
                Create an account with my
                <Link to={`/signup?ref=${referralCode}`} target="_blank">
                  <div className="inline-block py-0.5 px-2 mx-2 border border-green hover:bg-zinc-50 rounded-md font-medium shadow mx-1 text-green">
                    personal sign-up link
                  </div>
                </Link>
                . We will be automatically added as friends.
              </li>
              <li>
                Go through the onboarding tasks on your{" "}
                <Link to="/tasks" target="_blank">
                  <div className="inline-block py-0.5 px-2 mx-2 border border-green hover:bg-zinc-50 rounded-md font-medium shadow mx-1 text-green">
                    tasks page
                  </div>
                </Link>
                , which explain how our online process works and what is
                expected of members. Please let me know if you have any
                questions!
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
