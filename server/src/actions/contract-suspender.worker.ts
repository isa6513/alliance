import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from 'src/mail/mail.service';
import { MmsService } from 'src/mms/mms.service';
import { DataSource } from 'typeorm';
import { withPgAdvisoryLock } from '../notifs/lock-utils';
import { ActionsService } from 'src/actions/actions.service';
import { UserService } from 'src/user/user.service';

const PROCESS_ONE_LOCK_KEY1 = 0xa11a;
const PROCESS_ONE_LOCK_KEY2 = 0xce01;

@Injectable()
export class ContractSuspenderWorker {
  private readonly logger = new Logger(ContractSuspenderWorker.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly mmsService: MmsService,
    private readonly actionsService: ActionsService,
    private readonly userService: UserService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async dispatchDueNotifs() {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.SEND_DEV_NOTIFS !== '1'
    ) {
      return;
    }
    if (
      process.env.NODE_ENV === 'staging' ||
      process.env.NODE_ENV === 'production'
    ) {
      return;
    }

    const ran = await withPgAdvisoryLock(
      this.dataSource,
      PROCESS_ONE_LOCK_KEY1,
      PROCESS_ONE_LOCK_KEY2,
      async () => {
        const now = new Date();

        const usersToSuspend =
          await this.actionsService.findUsersToSuspend(now);

        for (const userId of usersToSuspend) {
          await this.userService.suspendContract(userId, true);
        }
      },
    );

    if (ran === null) {
      this.logger.log('processOne skipped bc of lock');
    }
  }
}
