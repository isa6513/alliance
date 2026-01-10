/** @fileoverview Utils for users */
import { User } from 'src/user/entities/user.entity';

export function isUserAwayAt(params: {
  user: Pick<User, 'awayRanges'>;
  date: Date;
}): boolean {
  const { user, date } = params;
  return user.awayRanges.some(
    (range) => date >= range.startDate && date < range.endDate,
  );
}

export function isUserAwayInRange(params: {
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
