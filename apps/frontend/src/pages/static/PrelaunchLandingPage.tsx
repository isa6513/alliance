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

/** Shared width + horizontal padding for hero copy and sections below. */
const LANDING_MAIN_COL = "mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-16";
const LANDING_BIG_COL = "px-4 sm:px-12 xl:px-32 w-full";

/** Gap between sections + outer vertical padding (avoids stacked py on each section). */
const LANDING_BODY = "gap-16 sm:gap-24 lg:gap-36 py-18 lg:py-28";
const LANDING_SECTION_INNER = "flex flex-col gap-y-6 lg:gap-y-8";

const SUBTITLE_CLASS = "text-xl text-zinc-900 lg:text-2xl";

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
      className="w-16 h-16 rounded-lg"
      alt={
        profile?.displayName
          ? `${profile.displayName} profile photo`
          : "Member profile photo"
      }
    />
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-row items-start gap-4 p-4 sm:p-6 rounded-md">
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
        <blockquote className="text-xl lg:text-2xl text-zinc-900 leading-snug">
          {quote}
        </blockquote>
        {profile?.displayName ? (
          <figcaption className="text-lg lg:text-xl text-zinc-500">
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
      <p className="text-xl font-semibold font-serif text-black lg:text-2xl">
        {title}
      </p>
      <p className="text-base text-zinc-900 lg:text-xl">{children}</p>
    </div>
  );
}

const PrelaunchLandingPage: React.FC = () => {
  const memberQuoteQueries = useMemberQuoteProfiles(
    MEMBER_QUOTES.map((q) => q.memberId),
  );

  return (
    <div className="flex flex-col">
      <section className="relative min-h-dvh w-full overflow-hidden">
        <img
          src={alliancePeople}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/75 via-black/40 to-black/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-black/80 via-black/45 to-transparent sm:h-44 md:h-52"
          aria-hidden
        />
        <PrelaunchNavbar transparent absolute showLogo />

        <div className="relative z-1 flex min-h-dvh w-full flex-col justify-end pb-10 pt-28 sm:pb-14 lg:pb-20 lg:pt-32">
          <div className={LANDING_MAIN_COL}>
            <p className="font-serif font-semibold text-4xl text-white drop-shadow-sm sm:text-5xl lg:text-7xl">
              The Alliance
            </p>
            <div className="mt-4 flex flex-col gap-y-4 text-lg text-white/95 drop-shadow-sm sm:mt-6 sm:gap-y-5 sm:text-xl lg:text-3xl">
              <p>
                We&apos;re a global group of people cooperating to improve the
                world. Each member contributes a consistent amount of their time
                each week, providing the reliability needed to plan precise,
                effective actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className={`flex flex-1 flex-col bg-white ${LANDING_BODY}`}>
        <section className="w-full flex flex-col gap-8">
          <div className={`${LANDING_MAIN_COL} ${LANDING_SECTION_INNER}`}>
            <div className="flex flex-col gap-4 mb-8 lg:mb-12">
              <p className="text-title-large w-full text-black">How we work</p>
              <p className={SUBTITLE_CLASS}>
                We design actions based on the number of members we can count
                on.
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

        <section className="bg-grey-0 py-16 lg:py-24">
          <div className={`${LANDING_BIG_COL} grid grid-cols-1 gap-2`}>
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
          <div className={`${LANDING_MAIN_COL} ${LANDING_SECTION_INNER}`}>
            <div className="flex flex-col gap-4">
              <p className="text-title-large w-full text-black">
                Our priorities
              </p>
              <p className={SUBTITLE_CLASS}>
                We are focused on global crises that are interconnected, affect
                billions of people, and are possible to solve with coordinated
                action.
              </p>
            </div>
            <ExamplePriorityCardList titleClass="text-lg lg:text-xl" />
          </div>
        </section>
        <section className="w-full bg-green/10 py-16 lg:py-28">
          <div className={`${LANDING_MAIN_COL} ${LANDING_SECTION_INNER} mb-12`}>
            <div className="flex flex-col gap-4">
              <p className="text-title-large w-full text-black">Our impact</p>
              <p className={SUBTITLE_CLASS}>
                At this stage, we are taking small-scale actions in order to
                learn and build our processes.
              </p>
              <Link
                to="/progress"
                className="mt-2 self-start flex flex-row items-center gap-2 bg-black hover:bg-zinc-800 text-white  px-4 py-3 rounded hover:cursor-pointer"
              >
                <p className="whitespace-nowrap flex flex-row items-center gap-x-1 text-lg lg:text-xl">
                  More examples
                </p>
                <ArrowRight className="w-4 h-4 " />
              </Link>
            </div>
          </div>
          <div
            className={`${LANDING_BIG_COL} flex flex-col items-center gap-12`}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1  sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {FEATURED_IMPACT_ACTIONS.slice(0, 4).map((action) => (
                  <FeaturedImpactCard
                    key={action.actionId}
                    {...action}
                    bgColor="white"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mx-auto flex flex-col gap-4">
                <img
                  src={ewaste}
                  alt="E-waste"
                  className="h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className={`${LANDING_MAIN_COL} ${LANDING_SECTION_INNER}`}>
            <div className="flex flex-col gap-4">
              <p className="text-title-large w-full text-black">Join us</p>
              <p className={SUBTITLE_CLASS}>
                Membership is currently by invitation only. If you are
                interested in becoming a member, please{" "}
                <a
                  href="mailto:contact@worldalliance.org"
                  className="text-link"
                >
                  email us
                </a>
                .
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
