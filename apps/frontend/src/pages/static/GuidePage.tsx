import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React from "react";
import ExampleActionCategoryCard from "../../components/ExampleActionCategoryCard";
import Footer from "../../components/Footer";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import MemberContract from "../../components/MemberContract";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import chevronRight from "../../assets/icons8-expand-arrow-96.png";

const GuidePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex flex-col md:flex-row mx-2 sm:mx-4 md:mx-12 lg:mr-40 gap-8 lg:gap-18 pt-8 md:pt-32 pb-56 justify-center">
        <aside className="min-w-80">
          <div className="flex flex-col md:sticky top-12 pr-8 lg:pr-18 md:border-r border-zinc-200">
            <h2 className=" !font-semibold !text-xl md:!text-xl max-w-2xl mb-4">
              Table of Contents
            </h2>
            <ol className="flex flex-col gap-y-1 *:hover:underline">
              <li>
                <a href="#priorities" className="">
                  Priorities
                </a>
              </li>
              <li>
                <a href="#structure" className="">
                  How we cooperate
                </a>
              </li>
              <li>
                <a href="#governance" className="">
                  How we make decisions
                </a>
              </li>
              <li>
                <a href="#membership" className="">
                  Member expectations
                </a>
              </li>
            </ol>
          </div>
        </aside>
        <div className="flex flex-col max-w-[46rem]">
          <div className="mx-auto w-full mb-4 md:mb-6">
            <h2 className="font-serif !font-semibold !text-4xl md:!text-6xl mb-3 text-black">
              Guide to the Alliance
            </h2>
          </div>

          <div className="flex flex-col gap-y-6">
            <MarkdownWrapper
              id="introduction"
              className=""
              markdownContent="
The Alliance is a group of individuals cooperating to end global crises. Members spend a small fraction of their time completing tasks that are designed to be effective and straightforward.

Our vision is to unite millions of people behind a global, expert-developed strategy. We are currently running experiments to prepare for future growth.
"
            />

            <div>
              <MarkdownWrapper
                id="priorities"
                markdownContent="
            
# Priorities

We aim to end global crises that harm or will harm billions of current and future people. In no particular order, we are focused on:

1. The decline of democratic institutions
2. Extreme poverty
3. Dangerous technological development
4. Environmental destruction

"
              />

              {/* <Card
                style={CardStyle.White}
                className="mt-6 p-4 md:p-4 text-lg cursor-pointer hover:bg-zinc-50 flex flex-row items-center justify-between"
              >
                <p className="text-base">
                  Our statement of purpose describes how we developed these
                  priorities.
                </p>
                <img src={chevronRight} className="w-4 h-4 rotate-270" />
              </Card> */}
            </div>

            <div>
              <MarkdownWrapper
                id="structure"
                markdownContent="

# How we cooperate

Members spend a small amount of time (currently 15 minutes per week) completing tasks on our online platform. Every task advances a specific plan designed by a full-time office.

**The foundation of the Alliance is member reliability.** Each member commits a small, consistent fraction of their time and resources. This commitment enables the office to plan effectively and helps members build trust in one another.

**The office unlocks collective potential by developing high-leverage actions.** As the Alliance grows, we plan to bring together experts from diverse fields to make increasingly impactful, complex plans.

For now, we are taking small-scale actions focused on learning, not direct impact. Examples of actions we’ve taken recently:
- We provided actionable feedback on the websites of three non-profits.
- We voted on proposals for a small grant.
- We requested news coverage of a coalition of businesses that adopted an environmentally-friendly policy.

Our flexible structure means we are capable of working together in many possible arrangements for many purposes. A few broad categories of actions include:

"
              />
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mt-6 w-full max-w-4xl mx-auto">
                <ExampleActionCategoryCard
                  title="Collective funding"
                  description="We pool funding for specific initiatives and projects within the Alliance and with our partners."
                />
                <ExampleActionCategoryCard
                  title="Economic pressure"
                  description="We coordinate shifts in our consumer behavior to encourage ethical practices and eliminate harmful practices."
                />
                <ExampleActionCategoryCard
                  title="Social pressure"
                  description="We target messages at decision-makers and direct public attention to important issues."
                />
                <ExampleActionCategoryCard
                  title="Synced communication"
                  description="We learn from and deliberate with one another to build a base of common knowledge."
                />
                <ExampleActionCategoryCard
                  title="Direct action"
                  description="We use our time and skills to advance certain causes, improve local and online communities, and more."
                />
                <ExampleActionCategoryCard
                  title="Collective governance"
                  description="We maintain and improve the Alliance by engaging in deliberations and other processes for feedback."
                />
              </div>
            </div>

            <MarkdownWrapper
              id="governance"
              markdownContent="

# How we make decisions

The office has the freedom to make any plans that advance our high-level priorities. Meanwhile, members provide input that ensures approval of the overall direction of the Alliance.

## Action planning
Planning actions is a creative, open-ended process that searches for levers of change which members can pull.

In the ideation for and development of an action plan, the office weighs many considerations. For instance:
- How does the action relate to the priorities of the Alliance?
- Will the action produce a tangible impact on the world?
- Will the action make effective use of members’ time?
- Will the action have any compounding effects – for instance, by providing an educational opportunity or growing the Alliance’s network?

## Member input
Given common recognition of the urgency of global crises, we bias towards action. Our common goal is to end these crises; it is not to create a world that is perfect for every member.

As a result, the office does not restrict itself to actions with unanimous agreement, and it does not necessarily pursue the most popular priorities. Our cooperation requires that members agree to a shared process that decides actions, rather than opt into each individual action, which means members will sometimes be asked to take actions they do not personally endorse.

However, our governance guarantees that the **majority of members find the majority of actions acceptable** — that is, believe that the Alliance overall produces more benefit than harm. This result is achieved with a membership-wide survey that occurs on a regular basis, or whenever it is requested by a majority of members.

Member input is also incorporated by other means. For instance, the office hosts discussions, asks members for action proposals, and solicits open-ended feedback.
"
            />
            <div>
              <MarkdownWrapper
                id="membership"
                className="mt-6"
                markdownContent="
# Member expectations

Membership is defined by commitment. Like any team, we can enact precise, complex plans only if we can depend on each other. On the other hand, if someone fails to complete a task, others’ efforts may go to waste.

Our expectation of reliability means that every member meaningfully expands what we are capable of accomplishing. Each member is a valued individual contributor; we respect their time when planning actions and designing the platform, as well as strive to answer every question and meet every need we can observe.

Membership is formalized by a contract:

"
              />

              <div className="mt-6">
                <MemberContract id="contract" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuidePage;
