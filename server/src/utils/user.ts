/** @fileoverview Utils for users */
import { User } from 'src/user/entities/user.entity';
import { findLeast } from './filter';
import { ContractEventType } from 'src/user/entities/contract-event.entity';
import { UserAwayRangeDto } from 'src/user/dto/away-range.dto';
import { CommunityMemberContactInfoDto } from 'src/user/dto/user-action-relations.dto';
import { Temporal } from '@js-temporal/polyfill';

export function computeIsContractActiveInFullRange(params: {
  user: Pick<User, 'contractEvents'>;
  startDate?: Date | null;
  endDate?: Date | null;
}): boolean {
  const { user, startDate, endDate } = params;
  const events = user.contractEvents ?? [];
  const startDateTime = startDate?.getTime() ?? -Infinity;
  const endDateTime = endDate?.getTime() ?? Infinity;

  const startingContractStatus =
    findLeast(
      events,
      (a, b) => b.date.getTime() - a.date.getTime(), // reverse order
      (event) => event.date.getTime() <= startDateTime,
    )?.type ?? ContractEventType.SUSPENDED;

  if (startingContractStatus === ContractEventType.SUSPENDED) {
    // Check if range is non-empty
    return startDateTime >= endDateTime;
  }

  return !events.some((event) => {
    const eventTime = event.date.getTime();
    return (
      startDateTime <= eventTime &&
      eventTime < endDateTime &&
      event.type === ContractEventType.SUSPENDED
    );
  });
}

export function computeIsAwayInRange(params: {
  user: Pick<User, 'awayRanges'>;
  startDate?: Date | null;
  endDate?: Date | null;
}): boolean {
  const { user, startDate, endDate } = params;
  return user.awayRanges.some(
    (awayRange) =>
      !(
        (endDate && endDate <= awayRange.startDate) ||
        (startDate && startDate >= awayRange.endDate)
      ),
  );
}

export function getContactInfo(params: {
  users: User[];
  timeZone: Temporal.TimeZoneLike;
}): CommunityMemberContactInfoDto[] {
  const { users, timeZone } = params;

  return users.map((user) => {
    const awayRanges: UserAwayRangeDto[] = (user.awayRanges ?? [])
      .slice()
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map((awayRange) =>
        Object.assign(new UserAwayRangeDto(), {
          id: awayRange.id,
          startDate: awayRange.startDate,
          endDate: awayRange.endDate,
          createdAt: awayRange.createdAt,
          reason: awayRange.reason,
          note: awayRange.note,
        }),
      );

    return new CommunityMemberContactInfoDto(user, timeZone, awayRanges);
  });
}
