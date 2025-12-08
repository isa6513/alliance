import { ActionsService } from 'src/actions/actions.service';
import {
  ActionActivity,
  ActionActivityType,
} from 'src/actions/entities/action-activity.entity';
import { Action } from 'src/actions/entities/action.entity';
import {
  ActionEvent,
  ActionStatus,
} from 'src/actions/entities/action-event.entity';
import {
  ContractEvent,
  ContractEventType,
} from 'src/user/entities/contract-event.entity';
import { Tag } from 'src/user/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { createTestApp, TestContext } from './e2e-test-utils';

describe('getUsersToSuspend (e2e)', () => {
  let ctx: TestContext;
  let actionsService: ActionsService;
  let actionRepo: Repository<Action>;
  let eventRepo: Repository<ActionEvent>;
  let activityRepo: Repository<ActionActivity>;
  let userRepo: Repository<User>;
  let tagRepo: Repository<Tag>;
  let contractEventRepo: Repository<ContractEvent>;
  let emailCounter = 0;
  let tagCounter = 0;

  beforeAll(async () => {
    ctx = await createTestApp([]);
    actionsService = ctx.app.get(ActionsService);
    actionRepo = ctx.dataSource.getRepository(Action);
    eventRepo = ctx.dataSource.getRepository(ActionEvent);
    activityRepo = ctx.dataSource.getRepository(ActionActivity);
    userRepo = ctx.dataSource.getRepository(User);
    tagRepo = ctx.dataSource.getRepository(Tag);
    contractEventRepo = ctx.dataSource.getRepository(ContractEvent);
  });

  afterAll(async () => {
    if (ctx?.app) {
      await ctx.app.close();
    }
  });

  const createCohortTag = async (): Promise<Tag> =>
    tagRepo.save(
      tagRepo.create({
        name: `Cohort ${++tagCounter}`,
        description: 'Test cohort',
      }),
    );

  const createUserWithSetup = async (options: {
    tags?: Tag[];
    contractEvents?: { type: ContractEventType; date: Date }[];
  }): Promise<User> => {
    const user = await userRepo.save(
      userRepo.create({
        email: `suspend-${++emailCounter}@example.com`,
        password: 'pass',
        name: `Suspension User ${emailCounter}`,
        tags: options.tags ?? [ctx.defaultTag],
      }),
    );

    if (options.contractEvents?.length) {
      await contractEventRepo.save(
        options.contractEvents.map((contractEvent) =>
          contractEventRepo.create({
            user,
            type: contractEvent.type,
            date: contractEvent.date,
          }),
        ),
      );
    }

    return userRepo.findOneOrFail({
      where: { id: user.id },
      relations: ['tags', 'contractEvents', 'awayRanges'],
    });
  };

  const createMemberAction = async (
    name: string,
    date: Date,
    options: {
      participatingTags?: Tag[];
      commitmentless?: boolean;
      useManualCohort?: boolean;
      manualCohortUsers?: User[];
      everyoneShouldComplete?: boolean;
      deadlineDate?: Date;
      deadlineStatus?: ActionStatus;
    } = {},
  ): Promise<Action> => {
    const action = await actionRepo.save(
      actionRepo.create({
        name,
        category: 'Test',
        body: 'Action body',
        taskContents: 'Task copy',
        shortDescription: `${name} short description`,
        participatingTags: options.participatingTags ?? [ctx.defaultTag],
        commitmentless: options.commitmentless ?? false,
        useManualCohort: options.useManualCohort ?? false,
        manualCohortUsers: options.manualCohortUsers,
        everyoneShouldComplete: options.everyoneShouldComplete ?? false,
        showToNonparticipating: true,
      }),
    );

    await eventRepo.save(
      eventRepo.create({
        title: `${name} member action`,
        description: 'Members take action',
        newStatus: ActionStatus.MemberAction,
        date,
        action,
      }),
    );

    if (options.deadlineDate) {
      await eventRepo.save(
        eventRepo.create({
          title: `${name} deadline`,
          description: 'Action deadline',
          newStatus: options.deadlineStatus ?? ActionStatus.Completed,
          date: options.deadlineDate,
          action,
        }),
      );
    }

    return action;
  };

  const addActionActivity = async (
    user: User,
    action: Action,
    type: ActionActivityType,
  ) =>
    activityRepo.save(
      activityRepo.create({
        action,
        actionId: action.id,
        user,
        userId: user.id,
        type,
      }),
    );

  it('filters to committed cohort members who failed both commitmentful actions', async () => {
    const cohortTag = await createCohortTag();
    const prevAction = await createMemberAction(
      'Commitmentful Prev',
      new Date('2024-01-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-01-20T00:00:00Z'),
      },
    );
    const currentAction = await createMemberAction(
      'Commitmentful Current',
      new Date('2024-02-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-02-20T00:00:00Z'),
      },
    );

    const failingUser = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2023-12-15T00:00:00Z'),
        },
      ],
    });
    const outsider = await createUserWithSetup({
      tags: [await createCohortTag()],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2023-12-15T00:00:00Z'),
        },
      ],
    });
    const partialCompleter = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2023-12-15T00:00:00Z'),
        },
      ],
    });

    await addActionActivity(
      failingUser,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      failingUser,
      currentAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      outsider,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      outsider,
      currentAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      partialCompleter,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      partialCompleter,
      currentAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      partialCompleter,
      currentAction,
      ActionActivityType.USER_COMPLETED,
    );

    const usersToSuspend = await actionsService.getUsersToSuspend(
      currentAction.id,
      prevAction.id,
      new Date('2024-03-01T00:00:00Z'),
    );

    expect(usersToSuspend.map((user) => user.id).sort()).toEqual([
      failingUser.id,
    ]);
  });

  it('does not suspend if deadlines are still upcoming', async () => {
    const cohortTag = await createCohortTag();
    const prevAction = await createMemberAction(
      'Future Deadline Prev',
      new Date('2024-03-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-04-01T00:00:00Z'),
      },
    );
    const currentAction = await createMemberAction(
      'Future Deadline Current',
      new Date('2024-04-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-05-01T00:00:00Z'),
      },
    );

    const failingUser = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-02-01T00:00:00Z'),
        },
      ],
    });

    await addActionActivity(
      failingUser,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      failingUser,
      currentAction,
      ActionActivityType.USER_JOINED,
    );

    const usersToSuspend = await actionsService.getUsersToSuspend(
      currentAction.id,
      prevAction.id,
      new Date('2024-03-15T00:00:00Z'),
    );

    expect(usersToSuspend).toHaveLength(0);
  });

  it('honors manual cohorts when selecting users to suspend', async () => {
    const cohortTag = await createCohortTag();
    const manualUser = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-01-15T00:00:00Z'),
        },
      ],
    });
    await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-01-15T00:00:00Z'),
        },
      ],
    });

    const prevAction = await createMemberAction(
      'Manual Prev',
      new Date('2024-03-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        commitmentless: true,
        useManualCohort: true,
        manualCohortUsers: [manualUser],
        deadlineDate: new Date('2024-03-20T00:00:00Z'),
      },
    );
    const currentAction = await createMemberAction(
      'Manual Current',
      new Date('2024-04-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        commitmentless: true,
        useManualCohort: true,
        manualCohortUsers: [manualUser],
        deadlineDate: new Date('2024-04-20T00:00:00Z'),
      },
    );

    const usersToSuspend = await actionsService.getUsersToSuspend(
      currentAction.id,
      prevAction.id,
      new Date('2024-05-01T00:00:00Z'),
    );

    expect(usersToSuspend.map((user) => user.id)).toEqual([manualUser.id]);
  });

  it('skips users whose contracts start after the actions they missed', async () => {
    const cohortTag = await createCohortTag();
    const prevAction = await createMemberAction(
      'Late Contract Prev',
      new Date('2024-05-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-05-25T00:00:00Z'),
      },
    );
    const currentAction = await createMemberAction(
      'Late Contract Current',
      new Date('2024-06-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-06-25T00:00:00Z'),
      },
    );

    const lateSigner = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-06-15T00:00:00Z'),
        },
      ],
    });
    const timelySigner = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-03-15T00:00:00Z'),
        },
      ],
    });

    await addActionActivity(
      lateSigner,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      lateSigner,
      currentAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      timelySigner,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      timelySigner,
      currentAction,
      ActionActivityType.USER_JOINED,
    );

    const usersToSuspend = await actionsService.getUsersToSuspend(
      currentAction.id,
      prevAction.id,
      new Date('2024-07-01T00:00:00Z'),
    );

    expect(usersToSuspend.map((user) => user.id)).toEqual([timelySigner.id]);
  });

  it('excludes users who suspended their contracts before the later action', async () => {
    const cohortTag = await createCohortTag();
    const prevAction = await createMemberAction(
      'Suspension Prev',
      new Date('2024-07-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-07-25T00:00:00Z'),
      },
    );
    const currentAction = await createMemberAction(
      'Suspension Current',
      new Date('2024-08-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        deadlineDate: new Date('2024-08-25T00:00:00Z'),
      },
    );

    const suspendedMember = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-05-01T00:00:00Z'),
        },
        {
          type: ContractEventType.SUSPENDED,
          date: new Date('2024-07-15T00:00:00Z'),
        },
      ],
    });
    const activeMember = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-05-01T00:00:00Z'),
        },
      ],
    });

    await addActionActivity(
      suspendedMember,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      suspendedMember,
      currentAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      activeMember,
      prevAction,
      ActionActivityType.USER_JOINED,
    );
    await addActionActivity(
      activeMember,
      currentAction,
      ActionActivityType.USER_JOINED,
    );

    const usersToSuspend = await actionsService.getUsersToSuspend(
      currentAction.id,
      prevAction.id,
      new Date('2024-09-01T00:00:00Z'),
    );

    expect(usersToSuspend.map((user) => user.id)).toEqual([activeMember.id]);
  });

  it('handles commitmentless actions without requiring joins', async () => {
    const cohortTag = await createCohortTag();
    const prevAction = await createMemberAction(
      'Commitmentless Prev',
      new Date('2024-09-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        commitmentless: true,
        deadlineDate: new Date('2024-09-20T00:00:00Z'),
      },
    );
    const currentAction = await createMemberAction(
      'Commitmentless Current',
      new Date('2024-10-01T00:00:00Z'),
      {
        participatingTags: [cohortTag],
        commitmentless: true,
        deadlineDate: new Date('2024-10-20T00:00:00Z'),
      },
    );

    const activeMember = await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [
        {
          type: ContractEventType.SIGNED,
          date: new Date('2024-08-15T00:00:00Z'),
        },
      ],
    });
    await createUserWithSetup({
      tags: [cohortTag],
      contractEvents: [],
    });

    const usersToSuspend = await actionsService.getUsersToSuspend(
      currentAction.id,
      prevAction.id,
      new Date('2024-11-01T00:00:00Z'),
    );

    expect(usersToSuspend.map((user) => user.id)).toEqual([activeMember.id]);
  });
});
