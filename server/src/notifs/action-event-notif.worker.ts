// action-event-notif.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ActionActivity,
  ActionActivityType,
} from '../actions/entities/action-activity.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from '../actions/entities/action-event.entity';
import { Action } from '../actions/entities/action.entity';
import { NotifsService } from '../notifs/notifs.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ActionEventNotifWorker {
  private readonly logger = new Logger(ActionEventNotifWorker.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ActionEvent)
    private readonly eventRepo: Repository<ActionEvent>,
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
    private readonly notifsService: NotifsService,
    private readonly userService: UserService,
  ) {}

  @Cron('* * * * *')
  async dispatchDueNotifs() {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.SEND_DEV_NOTIFS !== '1'
    ) {
      return;
    }

    const now = new Date();

    const due = await this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.action', 'action')
      .where('event.sendNotifsTo != :none', { none: NotificationType.None })
      .andWhere('event.date <= :now', { now })
      .andWhere('event.notifsSentAt IS NULL')
      .orderBy('event.date', 'ASC')
      .limit(2)
      .getMany();

    for (const event of due) {
      await this.processOne(event.id);
    }
  }

  async getBaseUsersForEvent(eventStatus: ActionStatus, action: Action) {
    if (
      eventStatus === ActionStatus.MemberAction ||
      eventStatus === ActionStatus.CommitmentsReached ||
      eventStatus === ActionStatus.Resolution //TODO: decide
    ) {
      const activities = await this.actionActivityRepository.find({
        where: {
          actionId: action.id,
          type: ActionActivityType.USER_JOINED,
        },
        relations: ['user'],
      });
      const users = action.commitmentless
        ? await this.userService.findActiveUsers()
        : activities.map((a) => a.user);

      return users;
    }

    return this.userService.findActiveUsers();
  }

  private async processOne(eventId: number) {
    await this.dataSource.transaction(async (manager) => {
      const event = await manager
        .createQueryBuilder(ActionEvent, 'event')
        .where('event.id = :id', { id: eventId })
        // .setLock('pessimistic_write') // or 'pessimistic_write_or_fail'
        // .setOnLocked('skip_locked')          // optional: avoid blocking if already locked (TypeORM >=0.3.15)
        .getOne();

      if (!event) return;

      if (
        event.notifsSentAt ||
        event.date > new Date() ||
        event.sendNotifsTo === NotificationType.None
      ) {
        return;
      }

      const action = await manager
        .createQueryBuilder()
        .relation(ActionEvent, 'action')
        .of(event)
        .loadOne<Action>();
      if (!action) return;

      const users = await this.getBaseUsersForEvent(event.newStatus, action);

      if (event.newStatus === ActionStatus.GatheringCommitments) {
        await this.notifsService.sendCommitmentNotifs(event, action, users);
      }

      if (event.newStatus === ActionStatus.MemberAction) {
        await this.notifsService.sendMemberActionNotifs(event, action, users);
      }

      this.logger.log('notifs sent for event ' + event.id);

      event.notifsSentAt = new Date();
      await manager.getRepository(ActionEvent).save(event);
    });
  }
}
