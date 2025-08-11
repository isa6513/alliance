import React from "react";
import Footer from "../../components/Footer";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import Expandable from "../../components/Expandable";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import ExampleActionCategoryCard from "../../components/ExampleActionCategoryCard";

const GuidePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex-1 container mx-auto pt-16 md:pt-28 pb-56 flex flex-col px-5">
        <div className="flex flex-col">
          <h2 className="mx-auto font-adobe !font-semibold !text-4xl md:!text-5xl text-center md:mb-6 max-w-3xl">
            Guide to the Alliance
          </h2>

          <MarkdownWrapper
            markdownContent="

The Alliance seeks to unite a critical mass of people into one force that represents humanity's collective interests. It aims to give its members, and ultimately a significant proportion of humanity, the ability to make deliberate, large-scale change.

It is important that individuals pursue good in their own lives. However, deliberate, large-scale change cannot occur unless individuals dedicate some of their resources to working together effectively and at scale.

The Alliance establishes a process that allows people to work together effectively and at scale.

While this project is highly ambitious, we believe it is the right time to undertake it seriously and carefully.

# Goals

As a global group of individuals who each have their own perspectives and beliefs, the only official stance of the Alliance, and the only belief required to be a member, is that humanity must cooperate to advance its collective interests. The Alliance has no platform separable from the wants and needs of humanity.

Therefore, the goals, structure, membership expectations, and process we describe in this guide all derive from the wants and needs expressed by initial members and our basic beliefs about the wants and needs of humanity. They are subject to future revision.

A founding principle of the Alliance is that the chief purpose of civilization is to serve individuals and future generations in their pursuit of fulfillment and happiness. That is, a world in which every individual has the resources and freedom to achieve happiness and fulfillment, humanity’s most important decisions are made with democratic input, and people live free of political, economic, and environmental insecurity.

As a starting point, we seek to address pressing ongoing global crises, among which are environmental destruction, extreme poverty, deterioration of democratic institutions, and unsafe technological development.

# Structure

Our current structure has two key components:
1. **Commitment-based membership.** We each dependably make a small amount of our time and resources available to the Alliance.
2. **Central strategy.** We are served by a strategic office that does intensive optimization of collective actions to ensure they are reasonable and effective.

Analogously, companies require:
1. Leadership to track the big picture and coordinate employee activity.
2. Employees that can be counted on to perform the tasks requested of them.

These two components are mutually dependent. Without a strategic office, members do not have concrete plans to act on. Without members that can be counted upon, the strategic office cannot make concrete plans.

When either component is missing, individuals are only able to take isolated actions or simple, one-off collective actions. In return for their commitment, members’ contributions have a massively amplified impact.

The Alliance will be able to plan in advance, coordinate flexibly, wield undeniable power, act proactively rather than reactively, and learn from experience. Simply put, our structure enables the same tight cooperation that makes corporations, governments, and other formal organizations coherent and effective.

We are capable of working together in many possible arrangements for many purposes. A few broad categories of collective actions we can take together include:

"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8 w-full max-w-6xl mx-auto">
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
              description="We learn from and deliberate with one another through a central channel that builds a base of common knowledge."
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

          <MarkdownWrapper
            markdownContent="

# How do we decide what actions to take?

We balance foundational moral principles, democratic input, and pragmatic considerations in determination of priorities.

## Morality
We believe that the establishment of an explicit moral foundation is important for priority-setting, is necessary to avoid risks associated with majority decision-making, and establishes a shared framework that will prevent members from talking past one another in deliberation.

In assessment of morality, we hew to a universal and unbiased principle that nearly all cultures share: that one should not treat others as one would not like to be treated by them. This includes respecting other’s preferred way of being treated, within reasonable limits.

More concretely, we believe that a fundamental tradeoff in civilization is one between individual autonomy and individual protections from the actions of others. In an ideal civilization, everyone would be free to do anything except to impose unwanted influences on others.

For example, this shared morality is violated in global crises such as environmental destruction, which involves parties non-consensually imposing heavy costs on billions of current and future people.

## Democratic input
We plan actions that satisfy both:
1. The collective interests of humanity, as we can best determine using unbiased data about global preferences and the aforementioned moral reasoning.
2. The collective interests of members, as we can determine through internal democratic processes.

We expect nearly complete overlap between these two categories. However, we will not pursue member interests that we perceive to negatively impact humanity at large. And, conversely, we will not pursue general human interests to which a majority of members are opposed.

To determine member interests, the strategic office will solicit input by running polls and deliberations, soliciting proposals, and so on.

The Alliance will also undergo a periodic *course adjustment* process to check that members feel their contributions are well-utilized and their voices are heard.

## Pragmatic considerations
The Alliance aims to address serious problems faced by civilization. This work involves unavoidable tradeoffs.

We will not be able to solve every problem. We will often need to prioritize crises based on their scale, tractability, and time-sensitivity.

The urgency of global crises will demand imperfect solutions. It will not be possible to consult and satisfy every stakeholder in every action that we take.

Need for swift action will preclude that every decision is made with full member consensus. The strategic office will address serious operational concerns with its plans, but its mission would be severely impeded by extensive discussion over every action.

We accept our decision-making process will inevitably contain imperfections and we will seek to minimize their harm.

# What does it mean to be a member?

## Dependability
Alliance members are individuals that have committed to cooperate with one another to build a better future for all.

**The Alliance will not work unless members reliably take the actions assigned to them, even in the face of uncertainty, disagreement, or inconvenience.**

The power of cooperation does not stem from attaining some idealistic harmony: it comes from working through conflict in order to reach a common goal. 

Members shape and abide by a *process* that governs the use of collective power, rather than decide individually whether or not to participate in every action. Similarly, a lawful society depends on citizens following every law, not only the laws they agree with.

The Alliance process is constrained by governance procedures that ensure that members approve of its goals and direction. However, it is impossible to create a future that is perfect from the perspective of every individual. Our common goal is rather to create a future that members agree is significantly better than the future that would occur otherwise.

We recognize the risks associated with collective decision-making. Our approach is to start small: we are building a group that voluntarily joins a collective process, and we put limits on the total amount of time and money that are collectively allocated.

## Terms
The following constitutes the basic promise that members make to one another:
1. Members will lend a dependable, finite amount of time/resources to the Alliance, which the strategic office can count on in planning future actions.
2. Members will engage in all actions for which the strategic office deems they are needed. Members will not be asked to take an action if they find either morally unacceptable or are incapable of fulfillment due to external circumstances (e.g. medical exemption, family emergency, or religious observance).

Moral unacceptability means that a member believes, after careful thought, that an action would violate their personal morality. It does not mean that the member merely has uncertainty about its effects.

## Required investment
Currently, the strategic office limits the total time required by members to below 1 hour/month.

If we demonstrate over time that we are effective and trustworthy, then the Alliance can play an increasingly large role in members’ lives and plan increasingly impactful actions.

## Example actions
The strategic office will break every required action into easy-to-follow steps.

Early members will participate in experiments and other work to help shape the Alliance. For instance:
- Shaping early governance processes.
- Talking to friends and family about the Alliance.
- Testing the Alliance online platform.
- Reading about and discussing Alliance priorities with other members.
- Participating in small-scale (<$1/day) donation-pooling experiments.

# Governance
1. In course adjustment, we will ask members what they think about the direction of the Alliance and whether or not they have any major concerns. We will collect common feedback, respond publicly with our plans to address the feedback, collect more feedback, and continue to iterate until the majority of members are satisfied.
2. Course adjustment will re-occur once 10 actions have been taken and 3 months have passed since the last course adjustment
3. As a backstop, course adjustment can occur at any time if requested by more than 50% of members.

The specific goal of course adjustment is to have more than 75% of members believe that:
1. 80% of their contributions to the Alliance will advance causes they support after course adjustment.
2. Their major concerns will be addressed after course adjustment.

This governance procedure will be in effect prior to public launch. When we are close to our public launch, we will collectively develop a set of more complex and formal procedures.


"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuidePage;
