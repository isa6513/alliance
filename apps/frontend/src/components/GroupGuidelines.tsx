import AppMarkdownWrapper from "@alliance/shared/ui/AppMarkdownWrapper";

const GroupOrganizerGuidelines = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-semibold text-xl md:text-2xl mb-4 ">
        Group lead guide
      </p>
      <AppMarkdownWrapper
        markdownContent="
# Responsibilities

**Your main responsibility is to ensure that members in your group complete their tasks on time.** You can make this happen however you see fit given the relationship you have with each member.

The goal is not for members to rely on you, but to feel accountable to you and the group. As with any leadership role, it’s important to strike a balance between being supportive and firm about expectations.

The Alliance is about cooperation, and cooperation relies on keeping promises. By leading your group effectively, you are helping the Alliance build a culture of trust and reliability, which is ultimately what will allow us to make complex, ambitious plans.

# Recommendations

When someone joins your group:
1. Add them as a friend.
2. Add them as a contact.
3. Send them a message introducing yourself.

During the week, check in on the group page to see who has and hasn’t completed the action. We recommend upvoting and possibly commenting on the activities of members who have completed the action to encourage them.

For those who have not completed the action, we recommend the following schedule:
1. The day before the deadline, text them a reminder at their preferred contact time.
2. The day of the deadline, call them at their preferred contact time.

The day after the deadline, reach out to anyone who did not complete the action and gently remind them of the importance of their commitment. You can ask them if they encountered any difficulties completing the action and offer to pass along feedback. You can also point them towards resources such as our “away feature” in settings if they are going to be offline for an extended period of time, or the “withdraw” option if they spent too long trying to complete the task.

# Sample messages

**1-day reminder message**

Hi Alice! Texting to remind you to complete this week’s action by midnight PST tomorrow. 

**Sample didn’t-complete message**

Hi Alice, I noticed that you missed last week’s action – I wanted to check in to make sure you didn’t bump into any difficulties while completing the task. I’m happy to pass along any feedback in case anything was confusing, or you encountered any bugs, etc.

      "
      />
    </div>
  );
};

const GroupMemberGuidelines = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-semibold text-xl md:text-2xl mb-4 ">About</p>
      <p>
        Your Alliance group consists of members who hold one another accountable
        and can convene for smaller-scale activities, such as discussions.
      </p>

      <p>
        Your group lead will remind you of deadlines and answer any questions
        you have about your tasks.
      </p>

      <p>
        Your group lead will likely only reach out to you if a deadline is
        approaching. However, if you have particular preferences or needs, you
        can let your group lead know. For example, you can ask them to call in
        the middle of the week, or to send you a text earlier than the deadline
        if you’re going to go on vacation.
      </p>
    </div>
  );
};

export { GroupOrganizerGuidelines, GroupMemberGuidelines };
