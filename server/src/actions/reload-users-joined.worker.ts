import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ActionsService } from './actions.service';

@Injectable()
export class ReloadUsersJoinedWorker {
  constructor(private readonly actionsService: ActionsService) {}

  @Cron('*/10 * * * *')
  async reloadAllActionUsersJoined() {
    this.actionsService.reloadAllActionUsersJoined();
  }
}
