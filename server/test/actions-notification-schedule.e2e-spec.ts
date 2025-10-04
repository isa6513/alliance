import * as request from 'supertest';
import { createTestApp, TestContext } from './e2e-test-utils';
import { Action } from 'src/actions/entities/action.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from 'src/actions/entities/action-event.entity';
import {
  ActionActivity,
  ActionActivityType,
} from 'src/actions/entities/action-activity.entity';
import { ActionTaskType } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

describe('Notification schedule (e2e)', () => {
  let ctx: TestContext;
  let actionRepo: Repository<Action>;
  let eventRepo: Repository<ActionEvent>;
  let activityRepo: Repository<ActionActivity>;

  beforeAll(async () => {
    ctx = await createTestApp([]);
    actionRepo = ctx.dataSource.getRepository(Action);
    eventRepo = ctx.dataSource.getRepository(ActionEvent);
    activityRepo = ctx.dataSource.getRepository(ActionActivity);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('includes future missed deadline notifications in schedule', async () => {
    const baseTime = new Date();
    const windowStart = baseTime.toISOString();
    const windowEnd = new Date(
      baseTime.getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const action = await actionRepo.save(
      actionRepo.create({
        name: 'Deadline Forecast Action',
        category: 'Testing',
        body: 'Body',
        shortDescription: 'Short',
        type: ActionTaskType.Activity,
        commitmentThreshold: 1,
      }),
    );

    const memberEvent = await eventRepo.save(
      eventRepo.create({
        title: 'Member Action Event',
        description: 'desc',
        newStatus: ActionStatus.MemberAction,
        sendNotifsTo: NotificationType.All,
        date: new Date(baseTime.getTime() - 24 * 60 * 60 * 1000),
        showInTimeline: true,
        action,
      }),
    );

    const resolutionEvent = await eventRepo.save(
      eventRepo.create({
        title: 'Resolution Event',
        description: 'desc',
        newStatus: ActionStatus.Resolution,
        sendNotifsTo: NotificationType.All,
        date: new Date(baseTime.getTime() + 5 * 24 * 60 * 60 * 1000),
        showInTimeline: true,
        action,
      }),
    );

    const userRepo = ctx.dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: ctx.testUserId } });

    if (!user) {
      throw new Error('Test user missing');
    }

    await activityRepo.save(
      activityRepo.create({
        action,
        actionId: action.id,
        user,
        userId: user.id,
        type: ActionActivityType.USER_JOINED,
      }),
    );

    const response = await request(ctx.app.getHttpServer())
      .get('/actions/notification-schedule')
      .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
      .query({ windowStart, windowEnd })
      .expect(200);

    const schedule = response.body as Array<{ type: string; actionId: number }>;

    const missedDeadlineEntry = schedule.find(
      (entry) =>
        entry.type === 'misseddeadline' && entry.actionId === action.id,
    );

    expect(missedDeadlineEntry).toBeDefined();

    // Cleanup
    await activityRepo.delete({ actionId: action.id, userId: user.id });
    await eventRepo.delete(resolutionEvent.id);
    await eventRepo.delete(memberEvent.id);
    await actionRepo.delete(action.id);
  });
});
