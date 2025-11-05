import { ActionEvent } from 'src/actions/entities/action-event.entity';

export function getDaysFromDeadline(
  deadlineEvent: ActionEvent,
  dateNow: Date,
): string {
  const days = Math.floor(
    (deadlineEvent.date.getTime() - dateNow.getTime()) / (1000 * 60 * 60 * 24),
  );
  return days.toString() + ' day' + (days === 1 ? '' : 's');
}

export function getHoursFromDeadline(
  deadlineEvent: ActionEvent,
  dateNow: Date,
): string {
  const hours =
    Math.floor(
      (deadlineEvent.date.getTime() - dateNow.getTime()) / (1000 * 60 * 60),
    ) % 24;
  return hours.toString() + ' hour' + (hours === 1 ? '' : 's');
}

export function getDaysAndHoursFromDeadline(
  deadlineEvent: ActionEvent,
  dateNow: Date,
): string {
  const hours = getHoursFromDeadline(deadlineEvent, dateNow);
  const days = getDaysFromDeadline(deadlineEvent, dateNow);
  if (days === '0 days') {
    return hours;
  }
  if (hours === '0 hours') {
    return days;
  }
  return `${days}, ${hours}`;
}

export const welcomeMessage = `Thanks for opting in to action notifications from the Alliance! You'll get a text here when a new action is ready to complete. Reply STOP to opt out.`;
