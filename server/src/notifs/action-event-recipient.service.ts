import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ActionActivity,
  ActionActivityType,
} from '../actions/entities/action-activity.entity';
import { Action } from '../actions/entities/action.entity';
import {
  ActionEvent,
  ActionStatus,
} from '../actions/entities/action-event.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ActionEventNotifType } from './entities/action-event-notif.entity';

@Injectable()
export class ActionEventRecipientService {
  constructor(
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
    private readonly userService: UserService,
  ) {}

  async getBaseUsersForEvent(
    eventStatus: ActionStatus,
    action: Action,
    eventDate: Date,
  ): Promise<User[]> {
    const targetGroupIds = new Set(
      (action.participatingGroups || []).map((group) => group.id),
    );
    const restrictToGroups = targetGroupIds.size > 0;

    const filterToEligible = (users: User[]): User[] => {
      const withContract = users.filter(
        (user) =>
          user.contractDateSigned &&
          user.contractDateSigned <= eventDate &&
          !user.contractDateSuspended,
      );
      if (!restrictToGroups) {
        return withContract;
      }
      return withContract.filter((user) =>
        (user.groups || []).some((group) => targetGroupIds.has(group.id)),
      );
    };

    if (eventStatus === ActionStatus.MemberAction) {
      const activities = await this.actionActivityRepository.find({
        where: {
          actionId: action.id,
          type: ActionActivityType.USER_JOINED,
        },
        relations: restrictToGroups ? ['user', 'user.groups'] : ['user'],
      });

      if (action.commitmentless) {
        const users = restrictToGroups
          ? await this.userService.findActiveUsersWithGroups()
          : await this.userService.findActiveUsers();
        return filterToEligible(users);
      }

      return filterToEligible(activities.map((activity) => activity.user));
    }

    if (eventStatus === ActionStatus.GatheringCommitments) {
      return filterToEligible(await this.userService.findActiveUsers());
    }

    return [];
  }

  private async filterForCompletion(
    users: User[],
    event: Pick<ActionEvent, 'newStatus' | 'action' | 'date'>,
  ): Promise<User[]> {
    const completionActivities = await this.actionActivityRepository.find({
      where: {
        userId: In(users.map((user) => user.id)),
        actionId: event.action.id,
        type: ActionActivityType.USER_COMPLETED,
      },
    });
    return users.filter(
      (user) =>
        !completionActivities.some((activity) => activity.userId === user.id),
    );
  }

  async getFilteredUsersForEvent(
    event: Pick<ActionEvent, 'newStatus' | 'action' | 'date'>,
    type: ActionEventNotifType,
  ): Promise<User[]> {
    const users = await this.getBaseUsersForEvent(
      event.newStatus,
      event.action,
      event.date,
    );
    return type === ActionEventNotifType.Announcement
      ? users
      : await this.filterForCompletion(users, event);
  }
}
