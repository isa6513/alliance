import React from "react";
import Footer from "../../components/Footer";
import MemberContract from "../../components/MemberContract";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import { href, Link } from "react-router";
import LargeActionCard from "../app/LargeActionCard";
import ExampleActionCardList from "../../components/ExampleActionCardList";
import { exampleMemberTaskAction } from "../../lib/exampleMemberTaskAction";
import ExampleActionCategoryList from "../../components/ExampleActionCategoryList";
import TableOfContents from "../../components/TableOfContents";
import {
  alliancePriorities,
  type AlliancePriority,
} from "../../lib/alliancePriorities";
import { ArrowRight } from "lucide-react";
import {
  GuideH1,
  GuideH2,
  GuideLi,
  GuideOl,
  GuideP,
  GuideSection,
  GuideStrong,
  GuideUl,
} from "./StaticDocShared";

const GuidePage: React.FC = () => {
  const tocSections = [
    { id: "guide-to-the-alliance", label: "About", level: 2 },
    { id: "introduction", label: "Introduction", level: 3 },
    { id: "structure", label: "Structure", level: 3 },
    { id: "actions", label: "Actions", level: 3 },
    { id: "priorities", label: "Priorities", level: 3 },
    { id: "roadmap", label: "Roadmap", level: 3 },
    // { id: "online-platform", label: "Online platform", level: 3 },
    { id: "resources", label: "Resources", level: 2 },
    { id: "foundation", label: "Foundation", level: 3 },
    { id: "governance", label: "Governance", level: 3 },
    { id: "faq", label: "FAQ", level: 3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />

      <div className="mx-6 md:mx-12 pt-8 md:pt-24 pb-56">
        <div className="flex flex-row md:gap-8 lg:gap-12 justify-center">
          <TableOfContents tocSections={tocSections} />

          <div className="flex flex-col gap-y-4 max-w-184 w-full min-w-0">
            <div className="mb-4 flex flex-col">
              <h1 className="text-title-large">Guide to the Alliance</h1>
            </div>
            <div className="flex flex-col gap-y-12">
              <GuideSection id="introduction">
                <GuideP>
                  The Alliance aims to facilitate{" "}
                  <GuideStrong>large-scale coordination</GuideStrong> over the
                  Internet. We are focused on four{" "}
                  <GuideStrong>global crises</GuideStrong>: extreme poverty,
                  environmental destruction, democratic decline, and dangerous
                  technological development.
                </GuideP>
                <GuideP>
                  <GuideStrong>Reliability</GuideStrong> is key to our strategy.
                  Every week, committed members participate in collective
                  actions that advance our shared goals. Since we can count on
                  members, we can plan each action with precision and predict
                  whether it will succeed.
                </GuideP>
                <GuideP>
                  We are in an experimental, invite-only stage. Eventually, we
                  hope to unite millions or hundreds of millions of people
                  behind an{" "}
                  <GuideStrong>
                    expert-guided, democratically approved plan
                  </GuideStrong>{" "}
                  that strategically mobilizes our collective economic,
                  political, and social resources.
                </GuideP>
              </GuideSection>

              <GuideSection id="structure">
                <GuideH1>Structure</GuideH1>

                <GuideP>The Alliance is composed of:</GuideP>
                <GuideOl>
                  <GuideLi>
                    <GuideStrong>A full-time office</GuideStrong> that designs
                    tasks to advance our priorities.
                  </GuideLi>
                  <GuideLi>
                    <GuideStrong>Members</GuideStrong> who commit to complete
                    tasks assigned to them.
                  </GuideLi>
                </GuideOl>
                <GuideP>
                  We built an online platform (web and mobile apps) that members
                  use to complete tasks.
                </GuideP>
                <div className="my-8 flex flex-col gap-y-4">
                  <div className="p-1 md:p-4 md:py-6 bg-zinc-50 rounded-md">
                    <LargeActionCard
                      action={exampleMemberTaskAction}
                      userRelation="none"
                      onUpdateActionState={() => {}}
                      onCompleteAction={() => {}}
                      showDetails={false}
                      className="pointer-events-none transform-[scale(0.9)] bg-white drop-shadow-xl drop-shadow-zinc-100"
                    />
                  </div>
                  <p className="text-center text-zinc-500 text-base">
                    Example task a member might see on the platform
                  </p>
                </div>
                <GuideP>
                  We depend on members reliably completing the tasks they are
                  assigned. Since we know exactly how many people will
                  participate in an action, we can plan precise and effective
                  actions. For example, we can:
                </GuideP>
                <GuideUl>
                  <GuideLi>Build a base of common knowledge over time.</GuideLi>
                  <GuideLi>
                    Plan experiments with statistical significance.
                  </GuideLi>
                  <GuideLi>
                    Make lifestyle changes only when there are enough members to
                    have a meaningful total impact.
                  </GuideLi>
                  <GuideLi>
                    Negotiate agreements with third parties, such as
                    corporations, backed by credible financial incentives (such
                    as a bulk purchase or promise of boycott).
                  </GuideLi>
                </GuideUl>
                <GuideP>
                  New members sign a{" "}
                  <GuideStrong>membership contract</GuideStrong> that sets a
                  clear expectation of reliability. Once they sign a contract,
                  we start to assign them tasks.
                </GuideP>
                <div className="my-8 flex flex-col gap-y-4">
                  <MemberContract
                    id="contract"
                    className="bg-grey-0 text-zinc-700 border-none p-8"
                  />
                  <p className="text-center text-zinc-500 text-base">
                    Our current membership contract
                  </p>
                </div>
                <GuideP>
                  If a member does not complete the tasks they are assigned, we
                  automatically suspend their contract and no longer assign them
                  tasks. They can re-sign the contract at any time.
                </GuideP>
              </GuideSection>

              <GuideSection id="actions">
                <GuideH1>Actions</GuideH1>
                <GuideP>
                  Planning actions is a creative, open-ended process that
                  searches for levers of change which members can pull.
                </GuideP>
                <GuideP>
                  When ideating for and developing an action, we weigh many
                  considerations. For instance:
                </GuideP>
                <GuideUl>
                  <GuideLi>
                    How does the action relate to the priorities of the
                    Alliance?
                  </GuideLi>
                  <GuideLi>
                    Will the action produce a tangible impact on the world?
                  </GuideLi>
                  <GuideLi>
                    Will the action make effective use of members’ time?
                  </GuideLi>
                  <GuideLi>
                    Will the action have any compounding effects – for instance,
                    by providing an educational opportunity or growing the
                    Alliance’s network?
                  </GuideLi>
                </GuideUl>
                <GuideP>Examples of actions we have taken:</GuideP>
                <div className="mt-6">
                  <ExampleActionCardList />
                </div>
              </GuideSection>

              <GuideSection id="priorities">
                <GuideH1>Priorities</GuideH1>
                <GuideP>Our efforts are focused on four global crises:</GuideP>
                <GuideOl>
                  <GuideLi>Extreme poverty</GuideLi>
                  <GuideLi>Environmental destruction</GuideLi>
                  <GuideLi>The decline of democratic institutions</GuideLi>
                  <GuideLi>Dangerous technological development</GuideLi>
                </GuideOl>
                <GuideP>
                  By restricting our focus to problems that are widely
                  recognized as urgent, we believe we can build a{" "}
                  <GuideStrong>
                    broad coalition with clear, shared goals
                  </GuideStrong>
                  .
                </GuideP>
                <GuideP>
                  These crises represent egregious violations of our
                  foundational{" "}
                  <Link to={href("/foundation")} className="text-link">
                    moral principle
                  </Link>
                  : that we should not treat others in ways that we do not want
                  to be treated. They cause, or have the potential to cause,
                  enormous harm to billions of people.
                </GuideP>
                <GuideP>
                  In addition, these crises are amenable to coordinated action
                  by individuals, because they are the complex result of
                  decisions made by billions of people over time. If we can
                  strategically channel trillions of dollars, billions of hours
                  of work, and millions of voices, we can make rapid and
                  enormous progress.
                </GuideP>
                {alliancePriorities.map((p: AlliancePriority) => (
                  <>
                    <GuideH2>{p.title}</GuideH2>
                    <GuideP>{p.description}</GuideP>
                  </>
                ))}
              </GuideSection>

              <GuideSection id="roadmap">
                <GuideH1>Roadmap</GuideH1>
                <GuideP>
                  Right now, we are running small-scale actions with the primary
                  goal of learning, not direct impact. We are focused on
                  building internal processes and structures that we can trust
                  to scale smoothly, including the way we develop and evaluate
                  actions. We expect this phase to last for at least another 6
                  months.
                </GuideP>

                <GuideP>
                  Once we are confident in our processes and structures, we will
                  launch publicly. After this point, we will shift our focus to
                  growth and impact.
                </GuideP>

                <GuideP>
                  As the Alliance grows, we plan to bring together experts from
                  diverse fields to make increasingly impactful, long-term
                  plans. Our online platform will enable direct communication
                  between these experts and millions of members to enact rapid,
                  large-scale change.
                </GuideP>
                <GuideP>
                  It is difficult to know exactly which actions we will take as
                  we grow. However, a few broad categories of actions include:
                </GuideP>
                <div className="mt-8">
                  <ExampleActionCategoryList />
                </div>
              </GuideSection>
              {/* 
              <GuideSection id="online-platform">
                <GuideH1>Online platform</GuideH1>
              </GuideSection> */}

              <GuideSection id="resources">
                <GuideH1>Resources</GuideH1>
                <div className="flex flex-col gap-y-4 mt-6">
                  <Link
                    to={href("/foundation")}
                    id="foundation"
                    className="flex flex-row items-center gap-x-2 group"
                  >
                    <GuideP>
                      <GuideStrong>
                        <span className="text-green group-hover:underline">
                          Our foundation
                        </span>
                      </GuideStrong>{" "}
                      describes how we derived our priorities
                    </GuideP>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={href("/governance")}
                    id="governance"
                    className="flex flex-row items-center gap-x-2 group"
                  >
                    <GuideP>
                      <GuideStrong>
                        <span className="text-green group-hover:underline">
                          Our governance
                        </span>
                      </GuideStrong>{" "}
                      describes office and member obligations
                    </GuideP>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={href("/faq")}
                    id="faq"
                    className="flex flex-row items-center gap-x-2 group"
                  >
                    <GuideP>
                      <GuideStrong>
                        <span className="text-green group-hover:underline">
                          Our FAQ
                        </span>
                      </GuideStrong>{" "}
                      answers common questions
                    </GuideP>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GuideSection>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuidePage;
