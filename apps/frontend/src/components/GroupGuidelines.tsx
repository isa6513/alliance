import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import Expandable from "./Expandable";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";

const GroupOrganizerGuidelines = () => {
  return (
    <div className="flex flex-col gap-y-4 px-2 md:px-0">
      <Expandable title="Running your group">
        <AppMarkdownWrapper
          markdownContent={`
# Responsibilities

**Your main responsibility is to ensure that members in your group complete their tasks on time.** You can make this happen however you see fit given the relationship you have with each member.

The goal is not for members to rely on you, but to feel accountable to you and the group. As with any leadership role, it's important to strike a balance between being supportive and firm about expectations.

By leading your group effectively, you are helping the Alliance build a culture of trust and reliability, which is ultimately what will allow us to make complex, ambitious plans.

# Recommendations

When someone joins your group:
1. Add them as a friend.
2. Add them as a contact.
3. Send them a message introducing yourself.

During the week, check in on the group page to see who has and hasn't completed the action. We recommend upvoting and possibly commenting on the activities of members who have completed the action to encourage them.

For those who have not completed the action, we recommend the following schedule:
1. The day before the deadline, text them a reminder at their preferred contact time.
2. The day of the deadline, call them at their preferred contact time.

The day after the deadline, reach out to anyone who did not complete the action and gently remind them of the importance of their commitment. You can ask them if they encountered any difficulties completing the action and offer to pass along feedback. You can also point them towards resources such as our "away feature" in settings if they are going to be offline for an extended period of time, or the "withdraw" option if they spent too long trying to complete the task.

# Sample messages

**1-day reminder message**

Hi Alice! Texting to remind you to complete this week's action by midnight PST tomorrow. 

**Sample didn't-complete message**

Hi Alice, I noticed that last week's action wasn't completed. The Alliance depends on everyone following through on their commitments, so I wanted to check in and understand what happened. If you ran into any confusion, bugs, etc., I'm happy to help get this resolved.
          `}
        />
      </Expandable>
      <Expandable title="Inviting new members">
        <AppMarkdownWrapper
          markdownContent={`
# Who to invite
**People who trust you.** They listen to what you have to say and respect your opinions.

**People who fit the Alliance’s culture.** They are kind, reliable, and polite to people who don’t share their beliefs.

**People who care about the world.** Maybe they have previously expressed concern about a societal problem, or enjoy volunteering.

# How to invite members

## Crafting an invitation

At minimum, your invite message should contain:
1. A description of the Alliance
2. A description of your role as a group lead (“I’ll help you complete tasks”)
3. The invite link

You can create a unique link for each person you invite on the [Invites](${getBaseUrl()}/groups?tab=invites) tab of your Group page.

## Sample invitation

Hi Alice - a few weeks ago, I joined an organization called the Alliance that I’m excited about. Our long-term goal is to coordinate millions of people online to change the world.

The experience has been great so far. We’re in an early experimental phase, so you just need to complete 15 minutes of tasks a week on the website. For example, we recently all went out and reported a pothole to our local governments. The point was to show everyone that potholes often get filled in just a few days, and it was neat to have a positive impact with very little effort.

To help the Alliance grow, I decided to start my own Alliance group. Would you like to join? I’m asking you in particular because we’ve talked in the past about climate change and other problems and this could become one of the most effective ways to make progress on those issues.

Since I run a group, I’ll help you complete tasks on time, answer any questions you have, etc. I’m also inviting Bob and Carol, and think it would be fun if we all did this together.

Here’s an invite link, which will automatically add you to my group & add us as friends: (your link here).

# Tips for effectiveness

The goal of an invite is to get a prospective member to sign the membership contract.

You should ultimately tailor your message to the person you’re inviting. However, to make your invites most likely to result in the person joining, you should consider:
1. Picking the best channel.
2. Describing your own experience.
3. Personalizing your message.
4. Painting a vision.
5. Following up.

**1. Picking the best channel**

Since the Alliance is complex, most successful invitations have occurred in person or over a call. During these conversations, it is often good to walk the new member through signing up and onboarding.

Some members, typically trusted friends who are likely to say yes, have joined via a simple text and follow-ups.

**2. Describing your own experience**

Prospective members are often uncertain about the kinds of tasks they will be asked to do. You can make the Alliance more concrete and convey your own enthusiasm by describing tasks, discussions, and other aspects of the Alliance you have enjoyed.

For example, you could talk about what your favorite action was and why, or what the current action is and why you think it’s interesting.

**3. Personalizing your message**

You should personalize your message in whatever ways you think are best. For instance, you could:
1. Use concepts familiar to the person you’re inviting when you describe the Alliance.
2. Explain what about the person you’re inviting makes you believe they’re a good fit.
3. Mention other people you are inviting that they may know.

**4. Painting a vision**

Many people are more enthusiastic about joining if the Alliance is presented as an ambitious long-term project, rather than a limited volunteer opportunity.

For instance, you could say: “I think it’s important to join because if millions of people around the world do so, we would create enormous change.”

**5. Following up**

Many invited people will express interest in joining the Alliance but not sign up immediately. Follow-up messages often prompt them to join.

You can track people you have invited on our Groups page. You should follow up after a couple of days, and if you still don’t hear back, you can check in with them again after a week or so.

When sending follow-up messages, it’s helpful to include the invite link again to make it easy to join.

# Answering questions

Please use our [guide](${getBaseUrl()}/guide) and our [FAQ](${getBaseUrl()}/faq) to answer any questions that come up.

If they ask a question that you don’t know the answer to, feel free to ask a member of the office.

          `}
        />
      </Expandable>
    </div>
  );
};

export { GroupOrganizerGuidelines };
