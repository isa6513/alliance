import {
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MmsOptout } from './mms-optout.entity';
import { SlackService } from 'src/slack/slack.service';

@Injectable()
export class MmsUnsubService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(MmsOptout)
        private readonly mmsOptoutRepository: Repository<MmsOptout>,
        private readonly slackService: SlackService,
    ) { }

    async unsubFromMms(phoneNumber: string, { reason, rawBody }: { reason: string, rawBody: string }): Promise<void> {
        const user = await this.userRepository.findOneBy({ phoneNumber });
        if (!user) {
            this.slackService.sendMessage(`Unhandled SMS opt-out from ${phoneNumber}`);
            return;
        }
        this.slackService.sendMessage(`${user.name} keyword unsubscribed from SMS`);
        const unsub = this.mmsOptoutRepository.create({ phoneNumber, reason, rawBody, user: { id: user.id } });
        await this.mmsOptoutRepository.save(unsub);
        await this.userRepository.update({ id: user.id }, { phoneNumberUnsubscribed: true });
    }

    async subscribeToMms(phoneNumber: string): Promise<void> {
        await this.userRepository.update({ phoneNumber }, { phoneNumberUnsubscribed: false });
    }

    async logUnhandledMessage(from: string, to: string, body: string): Promise<void> {
        this.slackService.sendMessage(`Unhandled inbound SMS from ${from}: ${body}`);
    }

}
