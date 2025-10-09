import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActionActivity,
  ActionActivityType,
} from '../actions/entities/action-activity.entity';
import { Action } from '../actions/entities/action.entity';
import { ActionStatus } from '../actions/entities/action-event.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

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
          user.contractDateSigned && user.contractDateSigned <= eventDate,
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
}
