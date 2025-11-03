// generic reminder

export const defaultEmailSubject =
  "You have #{days}, #{hours} left to complete #{n} Alliance action(s)";
export const defaultEmailContents = `Hi #{firstname},

#{n} Alliance action(s) need your completion.

You have #{days}, #{hours} left to complete the action(s). Please do so at this link: #{link}`;

export const defaultTextMessage =
  "You have #{days}, #{hours} left to complete #{n} Alliance action(s). #{link}";

// announcement

export const defaultAnnouncementEmailSubject =
  "Action needs completion: #{action}";
export const defaultAnnouncementEmailContents = `Hi #{firstname},
A new action is ready for you to complete: "#{action}"

Please complete the action at this link: #{link}`;

export const defaultAnnouncementTextMessage =
  "You have #{days} left to complete #{n} Alliance action(s). #{link}";

// missed deadline

export const defaultMissedDeadlineEmailSubject =
  "Failed to complete Alliance action by deadline";
export const defaultMissedDeadlineEmailContents = `Hi #{firstname}
The deadline for the current action has passed and you have not completed it. If you have in fact completed it, please contact us — we may have made a mistake.

The Alliance relies on the dependability of all members. If you are no longer interested in being a member of the Alliance, please suspend your contract.

If you do not complete the next action, we will suspend your contract on your behalf.`;

export const defaultMissedDeadlineTextMessage =
  "You failed to complete the current Alliance action. The deadline has now passed.";

export const hoursEmailSubject =
  "You have #{hours} left to complete an Alliance action";
export const hoursEmailContents = `Hi, #{firstname},
An Alliance action needs your completion.

You have #{hours} left to complete it. Please do so at the below link.
#{link}`;

export const hoursTextMessage =
  "You have #{hours} left to complete an Alliance action. #{link}";
