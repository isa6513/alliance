import React from "react";
import { Link } from "react-router";
import Footer from "../../components/Footer";
import MemberContract from "../../components/MemberContract";
import OversightQuestionDisplay from "../../components/OversightQuestionDisplay";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import TableOfContents, {
  type TocSection,
} from "../../components/TableOfContents";
import { exampleMemberTaskAction } from "../../lib/exampleMemberTaskAction";
import LargeActionCard from "../app/LargeActionCard";
import {
  GuideFootnote,
  GuideFootnotes,
  GuideFootnotesScope,
  GuideH1,
  GuideH2,
  GuideLi,
  GuideOl,
  GuideP,
  GuideSection,
  GuideStrong,
  GuideUl,
} from "./StaticDocShared";

const ExpertDescriptionPage: React.FC = () => {
  const tocSections: TocSection[] = [
    { id: "overview", label: "Overview", level: 3 },
    { id: "priorities", label: "Priorities", level: 3 },
    { id: "structure", label: "Structure", level: 3 },
    { id: "members", label: "Members", level: 4 },
    { id: "office", label: "Office", level: 4 },
    { id: "governance", label: "Governance", level: 3 },
    { id: "culture", label: "Culture", level: 3 },
    { id: "online-platform", label: "Online platform", level: 3 },
    { id: "roadmap", label: "Roadmap", level: 3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />

      <div className="mx-6 md:mx-12 pt-8 md:pt-24 pb-56">
        <div className="flex flex-row md:gap-8 lg:gap-12 justify-center">
          <TableOfContents tocSections={tocSections} />

          <div className="flex flex-col gap-y-4 max-w-184 w-full min-w-0">
            <div className="mb-8 md:mb-12 flex flex-col">
              <h1 className="text-title-large mb-4">About the Alliance</h1>
              <div className="flex flex-col gap-y-6 text-lg md:text-xl text-zinc-500">
                <p>Conceptual description of the Alliance for experts.</p>
              </div>
            </div>
            <GuideFootnotesScope>
              <div className="flex flex-col gap-y-12">
                <GuideSection id="overview">
                  <GuideH1>Overview</GuideH1>
                  <GuideP>
                    Hundreds of millions of people are worried about the state
                    of our world. Many recognize a need for decisive action, but
                    do not know what to do.
                  </GuideP>
                  <GuideP>
                    The Alliance aims to provide a clear answer. We believe
                    people would take many actions together that they are
                    unwilling to take individually if those actions were in line
                    with social norms and resulted in clear impact.
                    <GuideFootnote>
                      <a
                        href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0252892"
                        className="text-link"
                      >
                        Expectations of collective compliance drive individual
                        compliance.
                      </a>
                    </GuideFootnote>
                  </GuideP>
                  <GuideP>
                    We plan to{" "}
                    <GuideStrong>unite as many people as possible</GuideStrong>{" "}
                    behind an{" "}
                    <GuideStrong>
                      expert-guided, democratically approved plan
                    </GuideStrong>
                    . This plan will strategically direct members&apos;
                    collective economic, political, and social resources in
                    order to make rapid progress on humanity&apos;s most
                    pressing global crises.
                  </GuideP>
                  <GuideP>
                    We will{" "}
                    <GuideStrong>
                      use the{" "}
                      <Link to="#online-platform" className="text-link">
                        Internet
                      </Link>
                    </GuideStrong>{" "}
                    to break down this plan into tasks, and assign them to
                    members of the Alliance. Members are expected to{" "}
                    <GuideStrong>complete tasks reliably</GuideStrong>, allowing
                    for precise, long-term planning.
                  </GuideP>
                  <GuideP>
                    Routine, complex coordination between millions of people has
                    no precedent. The Alliance could become a key civilizational
                    force — one that, for instance, could enable massive
                    targeted boycotts, voluntary reductions of excessive
                    consumption, common knowledge of topics of choice, and
                    funding for neglected scientific research.
                  </GuideP>
                </GuideSection>

                <GuideSection id="priorities">
                  <GuideH1>Priorities</GuideH1>
                  <GuideP>
                    The Alliance is oriented around solving specific problems,
                    not around an ideology. We believe this will help us build a
                    large and diverse coalition, as well as focus on the
                    empirical effectiveness, rather than the type, of our
                    methods.
                  </GuideP>
                  <GuideP>We are focused on global crises that:</GuideP>
                  <GuideUl>
                    <GuideLi>Affect nearly everyone.</GuideLi>
                    <GuideLi>
                      Are highly urgent, often due to irreversible consequences.
                    </GuideLi>
                    <GuideLi>Are broadly agreed to be large problems.</GuideLi>
                    <GuideLi>
                      Are interrelated and therefore should be addressed
                      coherently.
                    </GuideLi>
                    <GuideLi>
                      Represent complex coordination problems that existing
                      institutions are ill-equipped to address.
                    </GuideLi>
                  </GuideUl>
                  <GuideP>These crises are:</GuideP>
                  <GuideOl>
                    <GuideLi>Extreme poverty.</GuideLi>
                    <GuideLi>Environmental destruction.</GuideLi>
                    <GuideLi>Democratic decline.</GuideLi>
                    <GuideLi>Development of dangerous technologies.</GuideLi>
                  </GuideOl>
                </GuideSection>

                <GuideSection id="structure">
                  <GuideH1>Structure</GuideH1>
                  <GuideP>The Alliance is composed of:</GuideP>
                  <GuideOl>
                    <GuideLi>
                      A full-time office that designs tasks to advance our
                      priorities.
                    </GuideLi>
                    <GuideLi>
                      A body of members who commit to complete tasks assigned to
                      them.
                    </GuideLi>
                  </GuideOl>
                  <GuideP>
                    We built an online platform (web and mobile apps) that
                    members use to complete tasks.
                  </GuideP>

                  <GuideH2 id="members">Members</GuideH2>
                  <GuideP>
                    The bedrock of the Alliance is our expectation that members
                    will complete the tasks that are assigned to them. This
                    predictability will allow us to build a flexible engine: we
                    will be able to make precise and complex action plans, wield
                    verifiable leverage, and learn from experience.
                  </GuideP>
                  <GuideP>For example, we can:</GuideP>
                  <GuideUl>
                    <GuideLi>
                      Plan experiments with statistical significance, without
                      relying on unpredictable external recruitment.
                    </GuideLi>
                    <GuideLi>
                      Make lifestyle changes only when there are enough members
                      to have a discernable total impact.
                    </GuideLi>
                    <GuideLi>
                      Negotiate agreements with third parties, such as
                      corporations, backed by credible incentives (such as a
                      bulk purchase or promise of boycott).
                    </GuideLi>
                  </GuideUl>
                  <GuideP>
                    We formalize expectations with a simple{" "}
                    <GuideStrong>contract</GuideStrong> that members sign to
                    join the Alliance.
                    <GuideFootnote>
                      <a
                        href="https://journals.sagepub.com/doi/10.1177/1043463102014002003"
                        className="text-link"
                      >
                        People tend to keep their word, and cooperation
                        increases dramatically when people make upfront
                        promises.
                      </a>
                    </GuideFootnote>{" "}
                    Right now, we have one contract available that asks members
                    to complete 15 minutes of tasks per week. Over time, we may
                    offer differentiated contracts; for example, tailored to
                    profession or disposable income.
                  </GuideP>
                  <div className="my-6 md:my-8 flex flex-col gap-y-4">
                    <MemberContract
                      id="contract"
                      className="bg-grey-0 text-zinc-700 p-8"
                    />
                    <p className="text-center text-zinc-500 text-base">
                      Our current membership contract
                    </p>
                  </div>
                  <GuideP>
                    For members, the contract has the benefit of guaranteeing a
                    limit on the time and resources they need to contribute,
                    allowing them to integrate Alliance participation into their
                    weekly routines. It also creates a sense that everyone is
                    contributing equally, which encourages each member to do
                    their part.
                  </GuideP>
                  <GuideP>
                    If a member does not regularly complete the tasks they are
                    assigned, we automatically suspend their contract, allowing
                    us to maintain collective expectations.
                  </GuideP>

                  <GuideH2 id="office">Office</GuideH2>
                  <GuideP>
                    The office maintains a global plan for the Alliance and
                    breaks it down into tasks for members to complete. Our goal
                    is to build a department of experts and strategists who run
                    a fast-paced, robust process to develop and evaluate
                    actions.
                  </GuideP>

                  <GuideP>
                    In devising actions, we will be able to draw inspiration
                    from many analogous efforts, such as grassroots activist
                    organizations, citizen science projects, and political
                    campaigns. However, our action development process will
                    differ from other efforts in several ways.
                  </GuideP>

                  <GuideP>
                    The most important difference is that, as a result of having
                    a reliable, continuous membership who lend a predictable
                    amount of time and resources, we can plan actions with high
                    precision and run them at a rapid pace. To take full
                    advantage of this fact, we will also aim to evaluate the
                    effectiveness of our actions with scientific rigor, and
                    learn systematically over time as we experiment with
                    different strategies.
                  </GuideP>

                  <GuideP>
                    We want to answer the general question: how best to make use
                    of the time and resources of our members? We believe this
                    difference opens up a vast space of possibilities for
                    actions that are as-of-yet unexplored.
                  </GuideP>

                  <GuideP>
                    Each action will be unique. However, templates include
                    raising funds, changing consumer behavior, concentrating
                    social pressure, educating members, and coordinating
                    political activity. Some tasks will be collective or highly
                    coordinated with other tasks; others will be assigned to
                    specific individuals based on their capacities, such as an
                    ability to influence a specific sector or vote in a specific
                    region.
                  </GuideP>
                  <GuideP>
                    Every action will be associated with a justification
                    explaining how it is expected to produce a tangible outcome,
                    such as a change in a corporation&apos;s policy or
                    validation of a specific hypothesis.
                  </GuideP>
                  <GuideP>
                    Expert evaluations of our actions will be core to our
                    operations, ensuring that each action either has a{" "}
                    <GuideStrong>
                      high likelihood of measurable impact, or helps us learn
                    </GuideStrong>
                    . We also hope that expert involvement will give members
                    confidence that each action is a worthwhile use of their
                    time, not just performative. The public trusts{" "}
                    <Link
                      to="https://www.pewresearch.org/science/2024/11/14/public-trust-in-scientists-and-views-on-their-role-in-policymaking/"
                      target="_blank"
                      className="text-link"
                    >
                      experts
                    </Link>{" "}
                    far more than it trusts{" "}
                    <Link
                      to="https://news.gallup.com/poll/1597/confidence-institutions.aspx"
                      target="_blank"
                      className="text-link"
                    >
                      existing institutions
                    </Link>
                    .
                  </GuideP>
                  <GuideP>
                    To be effective and in order to scale, we will need to
                    combine expert-driven strategy with local knowledge, and
                    strike a balance between centralization and
                    decentralization. We imagine that many actions will be
                    proposed by members or people in their communities, with
                    experts in an evaluative and supporting role.
                  </GuideP>
                </GuideSection>

                <GuideSection id="governance">
                  <GuideH1>Governance</GuideH1>
                  <GuideP>
                    Members will inevitably disagree with some or many of the
                    Alliance&apos;s efforts. To address this, we will establish
                    channels for communication between members and the office,
                    including actions themselves, which the office can use to
                    solicit feedback from members as well as provide members
                    with pertinent information.
                  </GuideP>
                  <GuideP>
                    In addition, disagreeing members will have several options
                    for formal recourse, including:
                  </GuideP>
                  <GuideUl>
                    <GuideLi>Leaving.</GuideLi>
                    <GuideLi>Expressing disapproval.</GuideLi>
                    <GuideLi>
                      Withdrawing from actions they believe are immoral.
                    </GuideLi>
                  </GuideUl>

                  <GuideH2>Leaving</GuideH2>
                  <GuideP>
                    Membership in the Alliance is voluntary. All power that the
                    Alliance holds is continuously, explicitly entrusted to it
                    by members. Members who substantially disapprove of the
                    Alliance can easily leave.
                  </GuideP>

                  <GuideP>
                    As a result, the basic structure of the Alliance holds the
                    office accountable to members.
                  </GuideP>

                  <GuideH2>Expressing disapproval</GuideH2>
                  <GuideP>
                    We would like to develop a democratic governance procedure
                    that:
                  </GuideP>
                  <GuideOl>
                    <GuideLi>
                      Gives members control over the overall direction of the
                      Alliance.
                    </GuideLi>
                    <GuideLi>
                      Gives the office freedom to make efficient, evidence-based
                      decisions.
                    </GuideLi>
                  </GuideOl>
                  <GuideP>
                    We believe we can accomplish this by regularly obtaining a
                    signal of overall approval or disapproval from members, and
                    adjusting course if approval falls beneath some threshold.
                    For now, the Alliance runs an oversight process every 6
                    months that consists of a single question:
                  </GuideP>
                  <OversightQuestionDisplay className="my-6 md:my-8" />
                  <GuideP>
                    This process gives disapproving members, who might otherwise
                    leave, an opportunity to redirect the Alliance to their
                    satisfaction. This process also biases towards action by
                    asking members to decide whether or not their disagreements
                    are worth inhibiting overall progress.
                  </GuideP>

                  <GuideH2>Withdrawing from actions</GuideH2>
                  <GuideP>
                    We guarantee that members will only ever have to take
                    actions they think are moral by providing an option to
                    withdraw from tasks they believe are immoral. Therefore, the
                    office will only be able to expect participation in an
                    action inasmuch as members believe the action is moral.
                  </GuideP>
                </GuideSection>

                <GuideSection id="culture">
                  <GuideH1>Culture</GuideH1>
                  <GuideP>
                    Among our members and staff, we aim to build a culture that
                    values:
                  </GuideP>
                  <GuideUl>
                    <GuideLi>
                      <GuideStrong>Responsibility</GuideStrong> and reliability,
                      so that we can make effective, long-term plans.
                    </GuideLi>
                    <GuideLi>
                      <GuideStrong>Rigor</GuideStrong> in evaluating the costs
                      and benefits of our actions, so that we retain trust and
                      effectiveness.
                    </GuideLi>
                    <GuideLi>
                      <GuideStrong>Outcomes</GuideStrong> over unanimous
                      agreement or perfect fairness, so that we can act with
                      appropriate urgency.
                    </GuideLi>
                    <GuideLi>
                      <GuideStrong>Cooperation</GuideStrong>, especially
                      willingness to take actions that benefit others more than
                      oneself, so that we can build a large coalition in which
                      members help advance each others&apos; preferred causes.
                    </GuideLi>
                    <GuideLi>
                      <GuideStrong>Transparency</GuideStrong> in our
                      decision-making, so that members can easily determine
                      whether they approve of the Alliance and therefore
                      effectively govern it.
                    </GuideLi>
                  </GuideUl>
                </GuideSection>

                <GuideSection id="online-platform">
                  <GuideH1>Online platform</GuideH1>
                  <GuideP>
                    We are developing an online platform (web and mobile
                    applications) over which Alliance actions are assigned and
                    completed. The platform centers around a personal{" "}
                    <GuideStrong>to-do list</GuideStrong> for each member which
                    lists tasks requiring their completion.
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
                    We place great importance on the quality of members&apos;
                    experience on the platform. With thoughtful design,
                    immersive progress updates, and social features co-developed
                    with members, we want to create an environment in which
                    members are eager for what&apos;s next, proud of what
                    they&apos;ve achieved, and connected to community.
                  </GuideP>
                </GuideSection>

                <GuideSection id="roadmap">
                  <GuideH1>Roadmap</GuideH1>

                  <GuideH2>Pre-launch</GuideH2>
                  <GuideP>
                    We are in an experimental, invite-only stage. We expect this
                    stage to last for at least another 6 months.
                  </GuideP>
                  <GuideP>
                    Our current goal is to set up for a{" "}
                    <GuideStrong>high-profile public launch</GuideStrong>{" "}
                    conducive to rapid and sustainable growth. We define “public
                    launch” as the point at which we transition from invite-only
                    membership to open-invite membership. After this point, we
                    will shift our focus on growth and impact.
                  </GuideP>
                  <GuideP>Prior to launch, we must:</GuideP>
                  <GuideUl>
                    <GuideLi>
                      Ensure our online platform is polished, secure, and
                      scalable.
                    </GuideLi>
                    <GuideLi>
                      Track whether a diverse set of members is sufficiently
                      reliable, retained, and able to effectively invite others.
                    </GuideLi>
                    <GuideLi>
                      Scale and build confidence in our internal process for
                      producing effective actions.
                    </GuideLi>
                    <GuideLi>
                      Build a group of thousands of experts who will provide a
                      set of coordinated public endorsements.
                    </GuideLi>
                    <GuideLi>
                      Complete a personal statement (by the founders, Sidney and
                      Mark) explaining our motivations and intentions.
                    </GuideLi>
                  </GuideUl>

                  <GuideH2>Post-launch</GuideH2>
                  <GuideP>
                    After we launch publicly, we hope to achieve regular,
                    visible successes that inspire more and increasingly diverse
                    people around the world to join us. We cannot yet describe
                    the precise actions that we will take as we grow, as this
                    will require both expert involvement and learned experience,
                    but we can provide illustrative examples.
                  </GuideP>
                  <GuideP>
                    <GuideStrong>With 1K-1M members</GuideStrong>, we will focus
                    on small tasks with clear wins to build momentum. For
                    example, we could:
                  </GuideP>
                  <GuideUl>
                    <GuideLi>
                      Fund land acquisitions for conservation or lift villages
                      out of poverty.
                    </GuideLi>
                    <GuideLi>
                      Petition journalists to feature small businesses who make
                      eco-friendly policy changes at our request.
                    </GuideLi>
                    <GuideLi>
                      Optimize communications by directing members to test
                      different messages to friends and family.
                    </GuideLi>
                  </GuideUl>
                  <GuideP>
                    <GuideStrong>With 1-10M members</GuideStrong>, we will begin
                    to develop a long-term plan and demonstrate the power of
                    large-scale coordination. For example, we could:
                  </GuideP>
                  <GuideUl>
                    <GuideLi>
                      Fund the creation of global scientific institutions.
                    </GuideLi>
                    <GuideLi>
                      Help members transition simultaneously to independent
                      media and social media companies.
                    </GuideLi>
                    <GuideLi>Run immense citizen science projects.</GuideLi>
                    <GuideLi>
                      Host global deliberations on topics such as AI governance
                      and solar radiation management to spur social awareness
                      and political demand.
                    </GuideLi>
                  </GuideUl>
                  <GuideP>
                    <GuideStrong>With 10-100M members</GuideStrong>, we will
                    drastically alter the world&apos;s political and economic
                    incentives. For example, we could:
                  </GuideP>
                  <GuideUl>
                    <GuideLi>
                      Spur virtuous competition with targeted boycotts,
                      certifications and pledges.
                    </GuideLi>
                    <GuideLi>Act as an employer of last resort.</GuideLi>
                    <GuideLi>
                      Write AI and environmental treaties and host global
                      education and deliberation to generate political demand
                      for them.
                    </GuideLi>
                    <GuideLi>
                      Run an enormous campaign to elect cooperative world
                      leaders in democratic countries.
                    </GuideLi>
                  </GuideUl>
                  <GuideP>
                    With 1B+ members, the Alliance could{" "}
                    <GuideStrong>
                      resolve certain global crises in their entirety
                    </GuideStrong>{" "}
                    by redirecting global capital, driving changes in consumer
                    behavior, influencing national and international politics,
                    and more.
                  </GuideP>
                </GuideSection>
              </div>
              <GuideFootnotes />
            </GuideFootnotesScope>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExpertDescriptionPage;
