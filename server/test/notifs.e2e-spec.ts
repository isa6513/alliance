import * as request from 'supertest';
import { NotifsModule } from 'src/notifs/notifs.module';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationCategory,
} from '../src/notifs/entities/notification.entity';
import { createTestApp, TestContext } from './e2e-test-utils';
import { Action } from 'src/actions/entities/action.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from 'src/actions/entities/action-event.entity';

describe('Notifications (e2e)', () => {
  let ctx: TestContext;
  let notifRepo: Repository<Notification>;
  let notifId: number;

  beforeAll(async () => {
    ctx = await createTestApp([NotifsModule]);
    notifRepo = ctx.dataSource.getRepository(Notification);
    const userRepo = ctx.dataSource.getRepository(User);

    const testUser = await userRepo.findOne({
      where: {
        id: ctx.testUserId,
      },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const testNotif = notifRepo.create({
      user: testUser,
      message: 'Test notification',
      category: NotificationCategory.FriendRequest,
      webAppLocation: 'test',
      mobileAppLocation: 'test',
    });
    await notifRepo.save(testNotif);
    notifId = testNotif.id;
  }, 50000);

  afterAll(async () => {
    await ctx.app.close();
  });

  it('user can list their notifications', async () => {
    const res = await ctx.agent.get('/notifs').expect(200);
    expect(res.body.length).toBe(1);
  });

  it('user can mark notification as read', async () => {
    await ctx.agent.post(`/notifs/read/${notifId}`).expect(201);

    const notifs = await ctx.agent.get('/notifs').expect(200);
    expect(notifs.body[0].read).toBe(true);
  });

  it('user can mark all notifications read and clear them', async () => {
    await ctx.agent.post('/notifs/read-all').expect(201);

    let notifs = await ctx.agent.get('/notifs').expect(200);
    expect(notifs.body.every((notif) => notif.read)).toBe(true);

    await ctx.agent.post('/notifs/clear').expect(201);

    notifs = await ctx.agent.get('/notifs').expect(200);
    expect(notifs.body.every((notif) => notif.cleared)).toBe(true);
  });

  it('admin can reload notification data for an event', async () => {
    const actionRepo = ctx.dataSource.getRepository(Action);
    const eventRepo = ctx.dataSource.getRepository(ActionEvent);

    const action = await actionRepo.save(
      actionRepo.create({
        name: 'Notif Action',
        category: 'Test',
        body: 'Body',
      }),
    );

    const event = await eventRepo.save(
      eventRepo.create({
        title: 'Notif Event',
        description: 'Event description',
        newStatus: ActionStatus.MemberAction,
        sendNotifsTo: NotificationType.All,
        date: new Date(Date.now() - 1000),
        showInTimeline: true,
        action,
      }),
    );

    await request(ctx.app.getHttpServer())
      .post(`/notifs/reloadNotifDataForEvent/${event.id}`)
      .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
      .expect(201);

    await eventRepo.delete(event.id);
    await actionRepo.delete(action.id);
  });
});
