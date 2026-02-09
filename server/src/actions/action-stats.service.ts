import { InjectRepository } from "@nestjs/typeorm";
import { Action, CustomActionStat } from "./entities/action.entity";
import { Injectable } from "@nestjs/common";
import { Between, IsNull, Not, Repository } from "typeorm";
import { OnetimeInvite, OnetimeInviteStatus } from "src/user/entities/onetime-invite.entity";
import { ActionStatus } from "./entities/action-event.entity";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ActionStatsService {
  constructor(
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    @InjectRepository(OnetimeInvite)
    private onetimeInviteRepository: Repository<OnetimeInvite>,
  ) { }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async computeAllActionStats() {
    const actions = await this.actionRepository.find({
      where: { customStatType: Not(IsNull()) },
      relations: { events: true },
    }).then(actions => actions.filter(action => action.status === ActionStatus.MemberAction));

    for (const action of actions) {
      await this.computeCustomActionStats(action);
    }
  }

  async computeCustomActionStats(action: Action) {
    if (!action.customStatType) {
      return null;
    }

    let statValue: number | undefined;
    switch (action.customStatType) {
      case CustomActionStat.USERS_INVITED:
        statValue = await this.computeUsersInvited(action);
        break;
      case CustomActionStat.NONE:
        return null;
      default:
        throw new Error(`Unknown custom stat type: ${action.customStatType satisfies never}`);
    }
    this.actionRepository.update(action.id, { customStatValue: statValue });
  }

  private async computeUsersInvited(action: Action) {
    const rangeStart = action.latestMemberActionEvent.event?.date;
    const rangeEnd = action.latestMemberActionEvent.deadline;
    if (!rangeStart || !rangeEnd) {
      return undefined;
    }
    const usersInvited = await this.onetimeInviteRepository.find({
      where: { createdAt: Between(rangeStart, rangeEnd), status: OnetimeInviteStatus.LINK_USED },
    });
    return usersInvited.length;
  }
}