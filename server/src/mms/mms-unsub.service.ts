import {
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MmsOptout } from './mms-optout.entity';
import { EventLogService } from 'src/eventlog/eventlog.service';
import { EventType } from 'src/eventlog/event-log.entity';

@Injectable()
export class MmsUnsubService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(MmsOptout)
        private readonly mmsOptoutRepository: Repository<MmsOptout>,
        private readonly eventLogService: EventLogService,
    ) { }

    async unsubFromMms(phoneNumber: string, { reason, rawBody }: { reason: string, rawBody: string }): Promise<void> {
        const user = await this.userRepository.findOneBy({ phoneNumber });
        if (!user) {
            this.eventLogService.sendMessage({
                type: EventType.SmsUnsubscribe,
                message: `Unhandled SMS opt-out from ${phoneNumber}`,
            });
            return;
        }
        this.eventLogService.sendMessage({
            type: EventType.SmsUnsubscribe,
            message: `${user.name} keyword unsubscribed from SMS`,
            userId: user.id,
        });
        const unsub = this.mmsOptoutRepository.create({ phoneNumber, reason, rawBody, user: { id: user.id } });
        await this.mmsOptoutRepository.save(unsub);
        await this.userRepository.update({ id: user.id }, { phoneNumberUnsubscribed: true });
    }

    async subscribeToMms(phoneNumber: string): Promise<void> {
        await this.userRepository.update({ phoneNumber }, { phoneNumberUnsubscribed: false });
    }

    async logUnhandledMessage(from: string, to: string, body: string): Promise<void> {
        this.eventLogService.sendMessage({
            type: EventType.SmsInbound,
            message: `Unhandled inbound SMS from ${from}: ${body}`,
            blob: { from, to, body },
        });
    }

}
