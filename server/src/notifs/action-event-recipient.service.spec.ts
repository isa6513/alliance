import { Repository } from 'typeorm';
import {
  ActionActivity,
  ActionActivityType,
} from '../actions/entities/action-activity.entity';
import { Action } from '../actions/entities/action.entity';
import { ActionStatus } from '../actions/entities/action-event.entity';
import { ActionEventRecipientService } from './action-event-recipient.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Group } from '../user/entities/group.entity';

describe('ActionEventRecipientService', () => {
  let findMock: jest.Mock;
  let repositoryMock: { find: jest.Mock };
  let userServiceMock: {
    findActiveUsersWithGroups: jest.Mock;
    findActiveUsers: jest.Mock;
  };
  let service: ActionEventRecipientService;

  const buildAction = (overrides: Partial<Action>): Action =>
    ({
      id: 1,
      participatingGroups: [],
      commitmentless: false,
      ...overrides,
    }) as Action;

  const buildUser = (
    id: number,
    groupIds: number[] = [],
    overrides: Partial<User> = {},
  ): User =>
    ({
      id,
      groups: groupIds.map((groupId) => ({ id: groupId }) as unknown as Group),
      contractDateSigned: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    }) as unknown as User;

  beforeEach(() => {
    findMock = jest.fn();
    repositoryMock = { find: findMock };
    userServiceMock = {
      findActiveUsersWithGroups: jest.fn(),
      findActiveUsers: jest.fn(),
    };

    service = new ActionEventRecipientService(
      repositoryMock as unknown as Repository<ActionActivity>,
      userServiceMock as unknown as UserService,
    );
  });

  it('returns joined users when event is in member action with no group restriction', async () => {
    const action = buildAction({ id: 42 });
    const joinedUsers = [buildUser(1), buildUser(2)];
    findMock.mockResolvedValue(
      joinedUsers.map((user) => ({ user }) as unknown as ActionActivity),
    );

    const result = await service.getBaseUsersForEvent(
      ActionStatus.MemberAction,
      action,
    );

    expect(findMock).toHaveBeenCalledWith({
      where: {
        actionId: action.id,
        type: ActionActivityType.USER_JOINED,
      },
      relations: ['user'],
    });
    expect(result).toEqual(joinedUsers);
    expect(userServiceMock.findActiveUsers).not.toHaveBeenCalled();
    expect(userServiceMock.findActiveUsersWithGroups).not.toHaveBeenCalled();
  });

  it('filters joined users by participating groups when restricted', async () => {
    const action = buildAction({
      participatingGroups: [{ id: 7 } as unknown as Group],
    });
    const eligibleUser = buildUser(1, [7]);
    const ineligibleUser = buildUser(2, [8]);
    findMock.mockResolvedValue([
      { user: eligibleUser } as unknown as ActionActivity,
      { user: ineligibleUser } as unknown as ActionActivity,
    ]);

    const result = await service.getBaseUsersForEvent(
      ActionStatus.MemberAction,
      action,
    );

    expect(findMock).toHaveBeenCalledWith({
      where: {
        actionId: action.id,
        type: ActionActivityType.USER_JOINED,
      },
      relations: ['user', 'user.groups'],
    });
    expect(result).toEqual([eligibleUser]);
  });

  it('returns active users when commitmentless action has no group restriction', async () => {
    const action = buildAction({ commitmentless: true });
    const activeUsers = [buildUser(5)];
    findMock.mockResolvedValue([]);
    userServiceMock.findActiveUsers.mockResolvedValue(activeUsers);

    const result = await service.getBaseUsersForEvent(
      ActionStatus.MemberAction,
      action,
    );

    expect(userServiceMock.findActiveUsers).toHaveBeenCalledTimes(1);
    expect(result).toEqual(activeUsers);
  });

  it('omits users without signed contracts for commitmentless actions', async () => {
    const action = buildAction({ commitmentless: true });
    const activeUsers = [
      buildUser(5),
      buildUser(6, [], { contractDateSigned: null }),
    ];
    findMock.mockResolvedValue([]);
    userServiceMock.findActiveUsers.mockResolvedValue(activeUsers);

    const result = await service.getBaseUsersForEvent(
      ActionStatus.MemberAction,
      action,
    );

    expect(result.map((user) => user.id)).toEqual([5]);
  });

  it('returns active grouped users filtered by participating groups for other statuses', async () => {
    const action = buildAction({
      participatingGroups: [{ id: 10 } as unknown as Group],
    });
    const eligibleUser = buildUser(1, [10]);
    const ineligibleUser = buildUser(2, [11]);
    userServiceMock.findActiveUsersWithGroups.mockResolvedValue([
      eligibleUser,
      ineligibleUser,
    ]);
    userServiceMock.findActiveUsers.mockResolvedValue([
      eligibleUser,
      ineligibleUser,
    ]);

    const result = await service.getBaseUsersForEvent(
      ActionStatus.GatheringCommitments,
      action,
    );

    expect(findMock).not.toHaveBeenCalled();
    expect(result).toEqual([eligibleUser]);
  });
});
