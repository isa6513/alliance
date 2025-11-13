import AppMarkdownWrapper from "@alliance/shared/ui/AppMarkdownWrapper";

const GroupOrganizerGuidelines = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-semibold text-xl md:text-2xl mb-4 ">
        Guide for group leaders
      </p>
      <AppMarkdownWrapper
        markdownContent="
# Purpose
It can be difficult for members to remember to complete their tasks. Members respond positively when another member reminds them that they did not make an abstract promise, but a promise to real people.

# Responsibilities

**Your responsibility is to ensure that members in your group complete their tasks on time.** You can make this happen however you want.

**Recommendations:**

When someone joins your group:
- Add them as a friend.
- Add them as a contact.
- Send them a message introducing yourself.

In general:
 - Try to upvote your members’ activities.

The day before deadline:
 - Contact everyone in the group who still has not completed the action.
 - Text.

 The day of deadline:
 - Contact everyone in the group who still has not completed the action.  
 - Call.

The day after the deadline:
 - Reach out to those who did not complete the action.
 - Ask them if they encountered any difficulties completing the action and offer to pass along feedback.
 - If helpful, point them towards resources such as our “away feature” in settings if they are going to be offline for an extended period of time, or the “withdraw” option if they spent too long trying to complete the task.

Be aware of members’ timezones – try to text/call at convenient times (generally after work).

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
      <p className="font-semibold text-lg md:text-xl">
        Guide for group members
      </p>
      <p>This group exists so that members can hold each other accountable.</p>
    </div>
  );
};

export { GroupOrganizerGuidelines, GroupMemberGuidelines };
