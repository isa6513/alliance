import React from "react";
import Footer from "../../components/Footer";
import MemberContract from "../../components/MemberContract";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import { href } from "react-router";
import ResourceButton from "../../components/ResourceButton";
import ExampleActionCardList from "../../components/ExampleActionCardList";
import ExampleActionCategoryList from "../../components/ExampleActionCategoryList";
import TableOfContents from "../../components/TableOfContents";
import { cn } from "@alliance/shared/styles/util";

// Guide page typography (no MarkdownWrapper)
const GuideSection = ({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("w-full mx-auto", className)} id={id}>
    {children}
  </div>
);
const GuideH1 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn(
      "font-semibold text-2xl md:text-3xl first:mt-0 mt-4 md:mt-8",
      className,
    )}
    {...props}
  />
);
const GuideH2 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "font-semibold text-xl md:text-2xl first:mt-0 mt-4 md:mt-8",
      className,
    )}
    {...props}
  />
);
const GuideP = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-zinc-900 text-lg first:mt-0 mt-2 md:mt-5", className)}
    {...props}
  />
);
const GuideOl = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={cn(
      "text-lg list-decimal list-inside first:mt-0 mt-2 md:mt-5 pl-4",
      className,
    )}
    {...props}
  />
);
const GuideUl = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    className={cn(
      "text-lg list-disc list-inside first:mt-0 mt-2 md:mt-5 pl-4",
      className,
    )}
    {...props}
  />
);
const GuideLi = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={cn("first:mt-0 mt-2", className)} {...props} />
);
const GuidePage: React.FC = () => {
  const tocSections = [
    { id: "priorities", label: "Priorities", level: 2 },
    { id: "how-we-work", label: "How we work", level: 2 },
    { id: "structure", label: "Structure", level: 3 },
    { id: "roadmap", label: "Roadmap", level: 3 },
    { id: "decisions", label: "How we make decisions", level: 2 },
    { id: "action-planning", label: "Action planning", level: 3 },
    { id: "oversight", label: "Oversight", level: 3 },
    { id: "resources", label: "Resources", level: 2 },
    { id: "foundation", label: "Foundation", level: 3 },
    { id: "governance", label: "Governance", level: 3 },
    { id: "faq", label: "FAQ", level: 3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />

      <div className="mx-6 md:mx-12 pt-8 md:pt-32 pb-56">
        <div className="mb-16 flex flex-col items-center">
          <h1 className="text-title-large text-center mb-6">
            Guide to the Alliance
          </h1>
          <div className="max-w-2xl flex flex-col gap-y-6 text-center text-lg">
            <p>
              The Alliance is a global group of individuals cooperating to
              improve the world. Each member spends a small fraction of their
              time completing tasks that advance our shared goals.
            </p>
            <p>
              Our long-term goal is to unite humanity behind a democratic,
              expert-developed plan to end global crises. Right now, we are
              running experiments to test our organizational structures and
              processes.
            </p>
          </div>
        </div>
        <div className="flex flex-row md:gap-8 lg:gap-12 justify-center">
          <TableOfContents tocSections={tocSections} />

          <div className="flex flex-col gap-y-4 max-w-184">
            <div className="flex flex-col gap-y-12">
              <GuideSection id="priorities">
                <GuideH1>Priorities</GuideH1>
                <GuideP>
                  Our immediate goal is to end global crises that harm or will
                  harm billions of current and future people. In no particular
                  order, we are focused on:
                </GuideP>
                <GuideOl>
                  <GuideLi>Extreme poverty</GuideLi>
                  <GuideLi>Environmental destruction</GuideLi>
                  <GuideLi>The decline of democratic institutions</GuideLi>
                  <GuideLi>Dangerous technological development</GuideLi>
                </GuideOl>
              </GuideSection>

              <GuideSection id="how-we-work">
                <GuideH1>How we work</GuideH1>
                <GuideH2 id="structure">Structure</GuideH2>
                <GuideP>
                  The Alliance is composed of a general body of members and a
                  full-time office of members.
                </GuideP>
                <GuideOl>
                  <GuideLi>
                    The office plans actions that advance Alliance priorities.
                  </GuideLi>
                  <GuideLi>
                    Members reliably complete these actions on our online
                    platform.
                  </GuideLi>
                </GuideOl>
                <GuideP>
                  Our strategy depends on members&apos; reliability. With high
                  and predictable levels of participation, we can make precise
                  and effective action plans. For example:
                </GuideP>
                <GuideUl>
                  <GuideLi>
                    We can plan experiments with statistical significance.
                  </GuideLi>
                  <GuideLi>
                    We can make agreements with external parties, such as
                    businesses, who know exactly what we can offer them or what
                    pressure we can bring to bear.
                  </GuideLi>
                  <GuideLi>
                    We can coordinate lifestyle changes only when there are
                    enough members to have a sufficiently large impact.
                  </GuideLi>
                </GuideUl>
                <GuideP>
                  As a result, we restrict membership to those who sign and
                  abide by our membership contract.
                </GuideP>
                <div className="mt-12 flex flex-col gap-y-4">
                  <MemberContract id="contract" className="bg-white p-6" />
                  <p className="text-center text-zinc-500">
                    Our current membership contract
                  </p>
                </div>
              </GuideSection>

              <GuideSection id="roadmap">
                <GuideH2>Roadmap</GuideH2>
                <GuideP>
                  Right now, we are taking small-scale actions focused on
                  learning, not direct impact. Here are examples of actions we
                  have taken:
                </GuideP>
                <div className="my-6">
                  <ExampleActionCardList />
                </div>
                <GuideP>
                  As the Alliance grows, we plan to bring together experts from
                  diverse fields to make increasingly impactful, long-term
                  plans. Our online platform will enable direct communication
                  between these experts and millions of members to enact rapid,
                  large-scale change.
                </GuideP>
                <GuideP>
                  It is difficult to know exactly which actions we will take
                  after we launch. However, a few broad categories of actions
                  include:
                </GuideP>
                <div className="mt-12">
                  <ExampleActionCategoryList />
                </div>
              </GuideSection>

              <GuideSection id="decisions">
                <GuideH1>How we make decisions</GuideH1>
                <GuideP>
                  Members provide input and participate in governance that
                  ensures approval of the overall direction of the Alliance.
                </GuideP>
                <GuideP>
                  Meanwhile, the office has the freedom to make any plans that
                  advance our high-level priorities and make effective use of
                  members’ time and resources.
                </GuideP>
                <GuideH2 id="action-planning">Action planning</GuideH2>
                <GuideP>
                  Planning actions is a creative, open-ended process that
                  searches for levers of change which members can pull.
                </GuideP>
                <GuideP>
                  In ideation for and development of an action plan, the office
                  weighs many considerations. For instance:
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
                <GuideH2 id="oversight">Oversight</GuideH2>
                <GuideP>
                  Our governance guarantees that the majority of members approve
                  of the Alliance&apos;s direction.
                </GuideP>
                <GuideP>
                  We conduct a membership-wide oversight process that occurs on
                  a regular basis. In the process, the office asks members if
                  they want the Alliance to continue operating as usual, or to
                  stop actions and adjust how it operates. The office collects
                  and responds to feedback until we reach an approval threshold
                  of 75%.
                </GuideP>
                <GuideP>This procedure achieves two goals:</GuideP>
                <GuideOl>
                  <GuideLi>
                    Members determine the high-level goals and methods of the
                    Alliance.
                  </GuideLi>
                  <GuideLi>
                    The office retains the freedom to plan any action that
                    advances approved goals with approved methods. It is not
                    required to do what is most popular, nor do actions need
                    unanimous support, so it can operate efficiently and
                    effectively.
                  </GuideLi>
                </GuideOl>
                <GuideP>
                  It is inevitable, though rare, that some members are assigned
                  tasks whose justifications they do not agree with. Given the
                  urgency of global crises, we collectively prioritize action
                  over perfect consensus.
                </GuideP>
                <GuideP>
                  In addition to formal governance, the office incorporates
                  member input by other means. For instance, the office hosts
                  discussions, asks members for action proposals, solicits
                  open-ended feedback, and so on.
                </GuideP>
              </GuideSection>

              <GuideSection id="resources">
                <GuideH1>Resources</GuideH1>

                <div className="flex flex-col gap-y-2 mt-8">
                  <ResourceButton to={href("/foundation")} id="foundation">
                    <p className="text-base">
                      <span className="font-semibold">Our foundation</span>{" "}
                      describes how we derived our priorities.
                    </p>
                  </ResourceButton>
                  <ResourceButton to={href("/governance")} id="governance">
                    <p className="text-base">
                      <span className="font-semibold">Our governance</span>{" "}
                      describes office and member obligations.
                    </p>
                  </ResourceButton>

                  <ResourceButton to={href("/faq")} id="faq">
                    <p className="text-base">
                      <span className="font-semibold">Our FAQ</span> answers
                      common questions.
                    </p>
                  </ResourceButton>
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
