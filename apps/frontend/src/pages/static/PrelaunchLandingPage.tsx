import React from "react";
import { useQueries } from "@tanstack/react-query";
import { Link, href } from "react-router";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import alliancePeople from "../../assets/alliance_people.webp";
import { actionsFindOne } from "@alliance/shared/client";
import type { ActionDto } from "@alliance/shared/client";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import Footer from "../../components/Footer";
import { formatTime } from "@alliance/shared/lib/utils";

const FEATURED_ACTION_IDS: number[] = [91, 84, 76, 75];

/** Shared width + horizontal padding for hero copy and sections below. */
const LANDING_MAIN_COL = "mx-auto w-full max-w-4xl px-6 sm:px-10 lg:px-16";

function usePrelaunchActions() {
  const results = useQueries({
    queries: FEATURED_ACTION_IDS.map((id) => ({
      queryKey: ["actions", "featured", id],
      queryFn: () =>
        actionsFindOne({ path: { id } }).then(
          (r) => r.data as ActionDto | undefined,
        ),
    })),
  });
  const actions = results
    .map((r) => r.data)
    .filter((a): a is ActionDto => a != null);
  const isPending = results.some((r) => r.isPending);
  return { actions, isPending };
}

function PreviewActionCard({ action }: { action: ActionDto }) {
  return (
    <Link
      to={href("/actions/:id", { id: action.id.toString() })}
      className="rounded-md group relative flex flex-row items-start justify-between gap-4 p-4 lg:p-6 bg-zinc-50 hover:bg-zinc-100"
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="text-zinc-500 text-sm">
          {formatTime(new Date(action.createdAt), { addSuffix: true })}
        </p>
        <p className="text-lg lg:text-xl font-medium text-black">
          {action.name}
        </p>
        <p className="text-zinc-500 text-base lg:text-lg">
          {action.shortDescription}
        </p>
      </div>
    </Link>
  );
}

const PrelaunchLandingPage: React.FC = () => {
  const { actions, isPending } = usePrelaunchActions();

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
                We&apos;re a global group of people cooperating to address
                global crises. Each member contributes a consistent amount of
                their time each week, providing the reliability needed to
                coordinate precise, effective actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-1 flex-col bg-white">
        <section className="w-full py-12 lg:py-36">
          <div
            className={`${LANDING_MAIN_COL} flex flex-col gap-y-4 lg:gap-y-6`}
          >
            <p className="text-heading-public w-full text-black">
              Recent actions
            </p>
            {isPending ? (
              <div className="flex justify-center py-8">
                <Spinner size="large" />
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2">
                {actions.map((action) => (
                  <PreviewActionCard key={action.id} action={action} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer className="bg-white" />
    </div>
  );
};

export default PrelaunchLandingPage;
