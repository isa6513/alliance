import {
  ProfileDto,
  userMembersPublic,
  userNmembers,
} from "@alliance/shared/client";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import React, { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import Footer from "../../components/Footer";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import PublicMemberDirectoryCard from "../../components/PublicMemberDirectoryCard";

const LANDING_MAIN_COL = "mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-16";
const LANDING_BIG_COL = "mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl w-full";
const LANDING_BODY = "gap-16 sm:gap-24 py-18 lg:py-24";
const SECTION_STACK = "flex flex-col gap-y-8 lg:gap-y-10";
const SECTION_HEAD = "flex flex-col gap-3 lg:gap-4";

const SUBTITLE_CLASS = "text-lg lg:text-xl";

export async function loader() {
  const res = await userNmembers();
  return res.data?.count;
}

const PeoplePage: React.FC = () => {
  const nmembers = useLoaderData<typeof loader>();
  const staffIds: Record<number, string> = useMemo(() => {
    return {
      10: "Mark Xu",
      7: "Sidney Hough",
      64: "Charles Lien",
      11: "Grant Hough",
      127: "Alex Hockett",
    };
  }, []);

  const [staffProfiles, setStaffProfiles] = useState<ProfileDto[]>([]);

  const [members, setMembers] = useState<ProfileDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultDisplayCount = 100;
  const [displayCount, setDisplayCount] = useState(defaultDisplayCount);

  const experts = [
    {
      name: "Janos Pasztor",
      description: "Former UN Assistant Secretary-General for Climate Change",
    },
    {
      name: "Denis Hayes",
      description:
        "Founding coordinator of Earth Day, Chair and CEO of the Bullitt Foundation",
    },
    {
      name: "Tara Chklovski",
      description: "Founder, CEO, Technovation",
    },
    {
      name: "Brice Lalonde",
      description: "Former French Minister of the Environment",
    },
    {
      name: "Connie Guglielmo",
      description: "Former Editor-in-Chief, CNET",
    },
    {
      name: "Beth Barnes",
      description: "Founder and CEO of METR",
    },
    {
      name: "Durwood Zaelke",
      description:
        "President, Institute for Governance & Sustainable Development",
    },
    {
      name: "Dustin Palmer",
      description: "Executive Director, US Programs at GiveDirectly",
    },
    {
      name: "Tom Luben",
      description: "Former US EPA ORD Scientist",
    },
    {
      name: "Romina Picolotti",
      description:
        "President, Center for Human Rights and Environment; former Argentine Secretary of the Environment",
    },
    {
      name: "Gernot Wagner",
      description: "Climate economist, Columbia Business School",
    },
    {
      name: "Jennifer King",
      description: "Privacy & Data Policy Fellow, Stanford HAI",
    },
    {
      name: "Ben Kalina",
      description: "Filmmaker and professor",
    },
    {
      name: "Nathan Calvin",
      description: "General Counsel at Encode AI",
    },
    {
      name: "Paul Gambill",
      description: "Climate entrepreneur, previous co-founder of Nori",
    },
    {
      name: "Oran Young",
      description: "Professor Emeritus, UC Santa Barbara",
    },
    {
      name: "Santiago Creuheras",
      description:
        "Harvard Ash Center Fellow; former Mexico Deputy Minister for the Environment and Sustainable Energy",
    },
    {
      name: "Travis Williams",
      description: "Professor of Chemistry, University of Southern California",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const membersRes = await userMembersPublic();

      setMembers(membersRes.data ?? []);

      // sort staff by names alphabetically
      setStaffProfiles(
        membersRes.data
          ?.filter((member) =>
            Object.keys(staffIds).includes(member.id.toString()),
          )
          .sort((a, b) =>
            (a.displayName ?? "").localeCompare(
              b.displayName ?? "",
              undefined,
              { sensitivity: "base" },
            ),
          )
          .reverse() ?? [],
      );
    };

    fetchData();
  }, [staffIds]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }
    const query = searchQuery.toLowerCase().trim();
    return members.filter((member) =>
      member.displayName?.toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  // Reset display count when search query changes
  useEffect(() => {
    setDisplayCount(defaultDisplayCount);
  }, [searchQuery]);

  const displayedMembers = useMemo(() => {
    return filteredMembers.slice(0, displayCount);
  }, [filteredMembers, displayCount]);

  const hasMoreMembers = filteredMembers.length > displayCount;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div
        className={`flex flex-1 flex-col text-base md:text-lg ${LANDING_BODY} pb-32 lg:pb-56`}
      >
        <section className="w-full">
          <div className={LANDING_MAIN_COL}>
            <h1 className="text-title-large text-center text-black">People</h1>
          </div>
        </section>

        <section className="w-full flex flex-col gap-16">
          <div className={`${LANDING_MAIN_COL} ${SECTION_STACK}`}>
            <div className={SECTION_HEAD}>
              <h2 className="text-heading-public">Office</h2>
              <p className={SUBTITLE_CLASS}>
                Members of the office plan actions and develop our online
                platform.
              </p>
            </div>
          </div>
          <div className={`${LANDING_BIG_COL}`}>
            <div className="grid grid-cols-1 gap-y-8 gap-x-16 sm:grid-cols-2">
              {staffProfiles
                .filter((member) => member.id !== undefined)
                .map((member) => (
                  <div key={member.id} className="flex gap-3 md:gap-4">
                    <div className="hidden md:block">
                      <AvatarProfile
                        pfp={member.profilePicture ?? null}
                        size="override"
                        className="w-20 h-20 rounded"
                      />
                    </div>
                    <div className="block md:hidden">
                      <AvatarProfile
                        pfp={member.profilePicture ?? null}
                        size="large"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-medium text-zinc-900">
                        {member.displayName}
                      </h3>
                      <div className="text-zinc-500 text-base md:mt-1">
                        <AppMarkdownWrapper
                          markdownContent={member.profileDescription ?? ""}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-grey-0 py-16 lg:py-24 flex flex-col gap-16">
          <div className={`${LANDING_MAIN_COL} ${SECTION_STACK}`}>
            <div className={SECTION_HEAD}>
              <h2 className="text-heading-public">Expert group</h2>
              <div className="flex flex-col gap-2">
                <p className={SUBTITLE_CLASS}>
                  Experts occasionally lend time, knowledge, or resources to the
                  Alliance.
                </p>
                <p className={`${SUBTITLE_CLASS} text-zinc-500`}>
                  This list only includes experts who have chosen to make their
                  information public.
                </p>
              </div>
            </div>
          </div>
          <div className={`${LANDING_BIG_COL}`}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
              {experts.map((expert) => (
                <div key={expert.name}>
                  <p className="text-zinc-900 text-base md:text-lg">
                    {expert.name}
                  </p>
                  <p className="text-zinc-500 text-base md:text-lg">
                    {expert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className={`${LANDING_MAIN_COL} ${SECTION_STACK}`}>
            <div className={SECTION_HEAD}>
              <h2 className="text-heading-public">Members</h2>
              <div className="flex flex-col gap-2">
                {nmembers !== undefined && (
                  <p className={SUBTITLE_CLASS}>
                    The Alliance has {nmembers}{" "}
                    {nmembers === 1 ? "member" : "members"}. Membership is
                    currently by invitation only.
                  </p>
                )}
                <p className={`${SUBTITLE_CLASS} text-zinc-500`}>
                  This directory only includes members who have chosen to make
                  their information public.
                </p>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-zinc-200 bg-white py-2 px-3 text-lg"
                />
              </div>
            </div>

            {filteredMembers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                  {displayedMembers.map((member) => (
                    <PublicMemberDirectoryCard
                      key={member.id}
                      member={member}
                    />
                  ))}
                </div>
                {hasMoreMembers && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setDisplayCount(displayCount + defaultDisplayCount)
                      }
                      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Show more ({filteredMembers.length - displayCount}{" "}
                      remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-zinc-500">
                {searchQuery.trim()
                  ? "No members found matching your search."
                  : "Loading members..."}
              </p>
            )}
          </div>
        </section>
      </div>
      <Footer className="bg-white" />
    </div>
  );
};

export default PeoplePage;
