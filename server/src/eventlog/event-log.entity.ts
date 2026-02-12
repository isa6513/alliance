import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateDateColumnTz } from "src/datasources/basecolumns";
import { Ty } from "src/tasks/entities/type";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

export enum EventType {
    AccountCreated = 'account_created',
    ContractSigned = 'contract_signed',
    ContractSuspended = 'contract_suspended',
    SmsUnsubscribe = 'sms_unsubscribe',
    SmsInbound = 'sms_inbound',
    SmsFailure = 'sms_failure',
    ForumActionAutocomplete = 'forum_action_autocomplete',
    ActionComment = 'action_comment',
}

@Entity()
export class EventLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: EventType })
    @ApiProperty({ enum: EventType, enumName: 'EventType' })
    event: EventType;

    @Column()
    @ApiProperty()
    message: string;

    @Column({ type: 'jsonb' })
    blob: Record<string, unknown>;

    @CreateDateColumnTz()
    @ApiProperty({ type: Date })
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'userId' })
    @ApiPropertyOptional({ type: () => User })
    user?: Ty<User>;

    @RelationId((event: EventLog) => event.user)
    @ApiPropertyOptional()
    userId?: number;
}