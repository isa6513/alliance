import React from "react";
import Footer from "../../components/Footer";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import MemberContract from "../../components/MemberContract";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";

import { href } from "react-router";
import ResourceButton from "../../components/ResourceButton";
import ExampleActionCardList from "../../components/ExampleActionCardList";
import ExampleActionCategoryList from "../../components/ExampleActionCategoryList";

const GuidePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex flex-col md:flex-row mx-6 md:mx-12 lg:mr-40 gap-8 lg:gap-18 pt-8 md:pt-32 pb-56 justify-center">
        <aside className="min-w-80">
          <div className="md:px-3 flex flex-col md:sticky top-12 md:pr-8 lg:pr-18 md:border-r border-zinc-200">
            <h2 className="!font-semibold !text-lg md:!text-xl max-w-2xl mb-4">
              Table of contents
            </h2>
            <ol className="flex flex-col gap-y-1 *:hover:underline text-zinc-900">
              <li>
                <a href="#priorities">Priorities</a>
              </li>
              <li>
                <a href="#structure">How we work</a>
              </li>
              <li className="ml-4">
                <a href="#structure" className="">
                  Structure
                </a>
              </li>
              <li className="ml-4">
                <a href="#structure-3" className="">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#decisions">How we make decisions</a>
              </li>
              <li className="ml-4">
                <a href="#decisions" className="">
                  Action planning
                </a>
              </li>
              <li className="ml-4">
                <a href="#decisions-2" className="">
                  Oversight
                </a>
              </li>
              <li>
                <a href="#resources">Resources</a>
              </li>
              <li className="ml-4">
                <a href="#governance" className="">
                  Foundation
                </a>
              </li>
              <li className="ml-4">
                <a href="#governance" className="">
                  Governance
                </a>
              </li>
              <li className="ml-4">
                <a href="#faq" className="">
                  FAQ
                </a>
              </li>
            </ol>
          </div>
        </aside>
        <div className="flex flex-col max-w-[46rem]">
          <div className="mx-auto w-full mb-4 md:mb-6">
            <h2 className="font-semibold text-3xl md:text-5xl mb-3 text-black">
              Guide to the Alliance
            </h2>
          </div>

          <div className="flex flex-col gap-y-4">
            <MarkdownWrapper
              id="introduction"
              className=""
              markdownContent="
The Alliance is a global group of individuals cooperating to improve the world. Each member spends a small fraction of their time completing tasks that advance our shared goals.

Our long-term goal is to unite humanity behind a democratic, expert-developed plan to end global crises. Right now, we are running experiments to test our organizational structures and processes.
"
            />

            <div>
              <MarkdownWrapper
                id="priorities"
                markdownContent="
            
# Priorities

Our immediate goal is to end global crises that harm or will harm billions of current and future people. In no particular order, we are focused on:

1. Extreme poverty
2. Environmental destruction
3. The decline of democratic institutions
4. Dangerous technological development

"
              />
            </div>

            <div>
              <MarkdownWrapper
                id="structure"
                markdownContent="

# How we work

## Structure

The Alliance is composed of a general body of members and a full-time office of members.
1. The office plans actions that advance Alliance priorities.
2. Members reliably complete these actions on our online platform.

Our strategy depends on members' reliability. With high and predictable levels of participation, we can make precise and effective action plans. For example:
- We can plan experiments with statistical significance.
- We can make agreements with external parties, such as businesses, who know exactly what we can offer them or what pressure we can bring to bear.
- We can coordinate lifestyle changes only when there are enough members to have a sufficiently large impact.

As a result, we restrict membership to those who sign and abide by our membership contract.

"
              />

              <div className="my-12 flex flex-col gap-y-4">
                <MemberContract id="contract" className="bg-zinc-50" />
                <p className="text-center text-zinc-500">
                  Our current membership contract
                </p>
              </div>

              <MarkdownWrapper
                id="structure-2"
                markdownContent="

Trust is the foundation of the Alliance. The office trusts members to complete tasks, which allows the office to plan effectively. Conversely, the office strives to be as transparent as possible so that members can trust the office to develop effective plans. If members trust the office, then their duty is as simple as completing their assigned tasks.

"
              />

              <MarkdownWrapper
                id="structure-3"
                markdownContent="

## Roadmap

Right now, we are taking small-scale actions focused on learning, not direct impact. Here are examples of actions we have taken recently:

"
              />

              <div className="my-8">
                <ExampleActionCardList />
              </div>

              <MarkdownWrapper
                id="structure-4"
                markdownContent="

As the Alliance grows, we plan to bring together experts from diverse fields to make increasingly impactful, long-term plans. Our online platform will enable direct communication between these experts and millions of members to enact rapid, large-scale change.

It is difficult to know exactly which actions we will take after we launch. However, a few broad categories of actions include:

"
              />

              <div className="mt-8">
                <ExampleActionCategoryList />
              </div>
            </div>

            <div>
              <MarkdownWrapper
                id="decisions"
                markdownContent="

# How we make decisions

Members provide input and participate in governance that ensures approval of the overall direction of the Alliance. 

Meanwhile, the office has the freedom to make any plans that advance our high-level priorities and make effective use of members’ time and resources.

## Action planning
Planning actions is a creative, open-ended process that searches for levers of change which members can pull.

In ideation for and development of an action plan, the office weighs many considerations. For instance:
- How does the action relate to the priorities of the Alliance?
- Will the action produce a tangible impact on the world?
- Will the action make effective use of members’ time?
- Will the action have any compounding effects – for instance, by providing an educational opportunity or growing the Alliance’s network?
"
              />

              <MarkdownWrapper
                id="decisions-2"
                markdownContent="

## Oversight
Our governance guarantees that the majority of members believe the majority of their contributions improve the world.

We conduct a membership-wide oversight process that occurs on a regular basis. In the process, the office asks members what they think about the direction of the Alliance and whether or not they have any major concerns. The office collects and responds to feedback until we reach an approval threshold of 75%.

This procedure achieves two goals:
1. Members determine the high-level goals and methods of the Alliance.
2. The office retains the freedom to plan any action that advances approved goals with approved methods. It is not required to do what is most popular, nor do actions need unanimous support, so it can operate efficiently and effectively.

It is inevitable, though rare, that some members are assigned tasks whose justifications they do not agree with. Given the urgency of global crises, it is important that we collectively prioritize action over perfect consensus.

In addition to formal governance, the office incorporates member input by other means. For instance, the office hosts discussions, asks members for action proposals, solicits open-ended feedback, and so on.
"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <MarkdownWrapper
                id="resources"
                markdownContent="

# Resources

"
              />

              <ResourceButton
                className="mt-4"
                to={href("/foundation")}
                id="foundation"
              >
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
                  <span className="font-semibold">Our FAQ</span> answers common
                  questions.
                </p>
              </ResourceButton>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuidePage;
