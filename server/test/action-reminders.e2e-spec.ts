import * as request from 'supertest';
import { createTestApp, TestContext } from './e2e-test-utils';
import { Repository } from 'typeorm';
import { Action } from 'src/actions/entities/action.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from 'src/actions/entities/action-event.entity';
import { ActionReminder } from 'src/actions/entities/action-reminder.entity';
import { ActionTaskType } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';

describe('Action reminders (e2e)', () => {
  let ctx: TestContext;
  let actionRepo: Repository<Action>;
  let eventRepo: Repository<ActionEvent>;
  let reminderRepo: Repository<ActionReminder>;

  beforeAll(async () => {
    ctx = await createTestApp([]);
    actionRepo = ctx.dataSource.getRepository(Action);
    eventRepo = ctx.dataSource.getRepository(ActionEvent);
    reminderRepo = ctx.dataSource.getRepository(ActionReminder);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('allows admins to create custom action reminders', async () => {
    const action = await actionRepo.save(
      actionRepo.create({
        name: 'Custom Reminder Action',
        category: 'Testing',
        body: 'Body',
        shortDescription: 'Short',
        type: ActionTaskType.Activity,
      }),
    );

    const memberEvent = await eventRepo.save(
      eventRepo.create({
        title: 'Member Action Event',
        description: 'desc',
        newStatus: ActionStatus.MemberAction,
        sendNotifsTo: NotificationType.All,
        date: new Date(),
        showInTimeline: true,
        action,
      }),
    );

    const sendAt = new Date(Date.now() + 30 * 60 * 1000);

    const response = await request(ctx.app.getHttpServer())
      .post(`/actions/${action.id}/events/${memberEvent.id}/reminders`)
      .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
      .send({
        sendAt: sendAt.toISOString(),
        customEmailMessage: 'Remember to participate!',
        userIds: [ctx.testUserId],
      })
      .expect(201);

    expect(response.body).toMatchObject({
      memberActionEventId: memberEvent.id,
      customEmailMessage: 'Remember to participate!',
    });

    const stored = await reminderRepo.findOne({
      where: { id: response.body.id },
      relations: ['users', 'memberActionEvent'],
    });

    expect(stored).toBeDefined();
    expect(stored?.users.map((user) => user.id)).toContain(ctx.testUserId);
    expect(stored?.memberActionEvent.id).toBe(memberEvent.id);

    await reminderRepo.delete({ id: response.body.id });
    await eventRepo.delete({ id: memberEvent.id });
    await actionRepo.delete({ id: action.id });
  });

  it('includes custom reminders in the notification schedule', async () => {
    const action = await actionRepo.save(
      actionRepo.create({
        name: 'Custom Reminder Schedule Action',
        category: 'Testing',
        body: 'Body',
        shortDescription: 'Short',
        type: ActionTaskType.Activity,
      }),
    );

    const memberEvent = await eventRepo.save(
      eventRepo.create({
        title: 'Schedule Member Event',
        description: 'desc',
        newStatus: ActionStatus.MemberAction,
        sendNotifsTo: NotificationType.All,
        date: new Date(),
        showInTimeline: true,
        action,
      }),
    );

    const sendAt = new Date(Date.now() + 20 * 60 * 1000);

    const userRepo = ctx.dataSource.getRepository(User);
    const testUser = await userRepo.findOneByOrFail({ id: ctx.testUserId });

    const reminder = await reminderRepo.save(
      reminderRepo.create({
        memberActionEvent: memberEvent,
        users: [testUser],
        sendAt,
      }),
    );

    const windowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const windowEnd = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const scheduleResponse = await request(ctx.app.getHttpServer())
      .get('/actions/notification-schedule')
      .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
      .query({ windowStart, windowEnd })
      .expect(200);

    const entries = scheduleResponse.body as Array<{
      type: string;
      eventId: number;
      recipients: Array<{ id: number }>;
    }>;

    const customEntry = entries.find(
      (entry) =>
        entry.type === 'customreminder' &&
        entry.eventId === memberEvent.id &&
        entry.recipients.some((recipient) => recipient.id === ctx.testUserId),
    );

    expect(customEntry).toBeDefined();

    await reminderRepo.delete({ id: reminder.id });
    await eventRepo.delete({ id: memberEvent.id });
    await actionRepo.delete({ id: action.id });
  });
});
