import React from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import alliancePeople from "../../assets/alliance_people.webp";
import ewaste from "../../assets/ewaste.webp";
import { userFindOne } from "@alliance/shared/client";
import type { ProfileDto } from "@alliance/shared/client";
import Footer from "../../components/Footer";
import ExamplePriorityCardList from "../../components/ExamplePriorityCardList";
import FeaturedImpactCard from "../../components/FeaturedImpactCard";
import { FEATURED_IMPACT_ACTIONS } from "../../content/featuredImpactActions";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import { ArrowRight } from "lucide-react";
import { cn } from "@alliance/shared/styles/util";

/** Shared width + horizontal padding for all landing content. */
const LANDING_MAIN_COL = "mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-16";

const LANDING_SECTION_GAP = "flex flex-col gap-y-6 lg:gap-y-8";
/** Same max-width + inner stack gap; vertical rhythm between blocks uses `space-y` on the parent. */
const LANDING_SECTION = `${LANDING_MAIN_COL} ${LANDING_SECTION_GAP}`;
const LANDING_PAGE_STACK =
  "flex flex-col space-y-12 md:space-y-16 lg:space-y-20 pb-16 lg:pb-20";

const SUBTITLE_CLASS = "text-lg text-zinc-900 lg:text-xl";

const MEMBER_QUOTES = [
  {
    quote:
      "I am convinced that the Alliance offers the platform for maximizing the impact of my time and energy contribution to the world over time. I want to be part of it and grow with it. They take your commitment seriously and will hold your feet to the fire. But it's just a few minutes per week and I've found every project thus far to be self-enriching and meaningful.",
    memberId: 96,
  },
  {
    quote:
      "On the whole, the world is not going in the right direction. We need new ideas to change that, and the Alliance is just that. But it will work only if we all participate.",
    memberId: 33,
  },

  {
    quote:
      "There is an inability to leverage collective will towards problems that almost everybody agrees exist (severe wealth inequality; climate change; political polarization to name a few). I think this is mostly the result of individuals not having clear actions that can affect the relevant issues. The Alliance is the natural solution to this.",
    memberId: 55,
  },
];

function useMemberQuoteProfiles(memberIds: number[]) {
  return useQueries({
    queries: memberIds.map((memberId) => ({
      queryKey: ["user", "slug", memberId],
      queryFn: () =>
        userFindOne({ path: { id: memberId } }).then(
          (r) => (r.data ?? null) as ProfileDto | null,
        ),
      staleTime: 60 * 60 * 1000,
    })),
  });
}

function MemberQuoteCard({
  quote,
  profile,
  isPending,
}: {
  memberId: number;
  quote: string;
  profile: ProfileDto | null;
  isPending: boolean;
}) {
  const avatar = (
    <AvatarProfile
      pfp={profile?.profilePicture ?? null}
      size="override"
      className="w-12 h-12 rounded"
      alt={
        profile?.displayName
          ? `${profile.displayName} profile photo`
          : "Member profile photo"
      }
    />
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-row items-start gap-4 rounded-md">
      <div className="shrink-0">
        {isPending ? (
          <div
            className="size-9 animate-pulse rounded bg-zinc-200"
            aria-hidden
          />
        ) : (
          avatar
        )}
      </div>
      <figure className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <blockquote className="text-base lg:text-lg text-zinc-900 leading-snug">
          {quote}
        </blockquote>
        {profile?.displayName ? (
          <figcaption className="text-base lg:text-lg text-zinc-500">
            {profile.displayName}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}

function HowItWorksCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-md", className)}>
      <p className="text-xl font-medium text-black lg:text-2xl">{title}</p>
      <p className="text-base text-zinc-900 lg:text-xl">{children}</p>
    </div>
  );
}

const PrelaunchLandingPage: React.FC = () => {
  const memberQuoteQueries = useMemberQuoteProfiles(
    MEMBER_QUOTES.map((q) => q.memberId),
  );

  return (
    <div className="flex flex-col bg-white">
      <div className={LANDING_PAGE_STACK}>
        <section className="relative w-full bg-white">
          <PrelaunchNavbar transparent={false} absolute={false} />
          <div
            className={`${LANDING_MAIN_COL} flex flex-col gap-y-4 pt-6 sm:pt-8 lg:pt-10`}
          >
            <p className="hidden md:block text-center font-serif font-semibold text-4xl text-black sm:text-5xl lg:text-6xl">
              The Alliance
            </p>
            <div className="text-center flex flex-col gap-y-4 text-lg text-zinc-900 sm:gap-y-5 sm:text-xl lg:text-2xl">
              <p>
                We&apos;re a global group of people cooperating to improve the
                world.
              </p>
              <Link
                to="#join-us"
                className="mx-auto self-start font-medium rounded-full bg-green px-6 py-3 text-base lg:text-lg text-white hover:bg-green/80"
              >
                Request an invite
              </Link>
            </div>
          </div>
          <div className={LANDING_MAIN_COL}>
            <img
              src={alliancePeople}
              alt="Alliance members at a meetup"
              className="mt-8 md:mt-12 w-full h-auto rounded-md"
            />
          </div>
        </section>

        <section className="w-full bg-white">
          <div className={LANDING_SECTION}>
            <div className="flex flex-col gap-4">
              <p className="text-title-medium w-full text-black">How we work</p>
              <p className={SUBTITLE_CLASS}>
                Each member contributes a consistent amount of their time each
                week, providing the reliability needed to plan precise,
                effective actions.
              </p>
            </div>
            <div className="flex flex-row divide-x divide-zinc-200">
              <HowItWorksCard title="Members" className="w-1/2 pr-6 lg:pr-12">
                Alliance members complete weekly tasks on our online platform.
                Tasks take no more than 15 minutes per week, so members can
                easily fit them into their weekly routines.
              </HowItWorksCard>
              <HowItWorksCard title="Office" className="w-1/2 pl-6 lg:pl-12">
                Alliance staff design tasks in order to achieve a measurable
                impact. Since the office knows how many members will
                participate, it can predict how likely each action is to
                succeed.
              </HowItWorksCard>
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-4">
          <div className={LANDING_SECTION}>
            {MEMBER_QUOTES.map((item, index) => (
              <MemberQuoteCard
                key={`${item.memberId}-${index}`}
                memberId={item.memberId}
                quote={item.quote}
                profile={memberQuoteQueries[index]?.data ?? null}
                isPending={memberQuoteQueries[index]?.isPending ?? true}
              />
            ))}
          </div>
        </section>

        <section className="w-full">
          <div className={LANDING_SECTION}>
            <div className="flex flex-col gap-4">
              <p className="text-title-medium w-full text-black">
                Our priorities
              </p>
              <p className={SUBTITLE_CLASS}>
                We focus on global crises that are interconnected, affect
                billions of people, and are possible to solve with coordinated
                action.
              </p>
            </div>
            <ExamplePriorityCardList titleClass="text-lg lg:text-xl" />
          </div>
        </section>
        <section className="w-full bg-white">
          <div className={LANDING_SECTION}>
            <div className="flex flex-col gap-4">
              <p className="text-title-medium w-full text-black">Our impact</p>
              <p className={SUBTITLE_CLASS}>
                At this stage, we are taking small-scale actions in order to
                learn and build our processes.
              </p>
              <Link
                to="/progress"
                className="self-start flex flex-row items-center gap-2 bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-full hover:cursor-pointer"
              >
                <p className="whitespace-nowrap flex flex-row items-center gap-x-1 text-base lg:text-lg">
                  More examples
                </p>
                <ArrowRight className="w-4 h-4 " />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURED_IMPACT_ACTIONS.slice(0, 4).map((action) => (
                  <FeaturedImpactCard key={action.actionId} {...action} />
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-4">
              <img
                src={ewaste}
                alt="E-waste"
                className="h-full w-full object-cover rounded-md"
              />
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className={LANDING_SECTION} id="join-us">
            <div className="flex flex-col gap-4 p-8 sm:p-12 lg:p-16 bg-grey-0">
              <p className="text-title-medium w-full text-black">Join us</p>
              <p className={SUBTITLE_CLASS}>
                Membership is currently by invitation only. If you want to join,{" "}
                send us an{" "}
                <a
                  href="mailto:contact@worldalliance.org"
                  className="text-link"
                >
                  email
                </a>{" "}
                with a short description of yourself.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer className="bg-white" />
    </div>
  );
};

export default PrelaunchLandingPage;
