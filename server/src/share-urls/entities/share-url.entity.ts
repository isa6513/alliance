import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Action } from 'src/actions/entities/action.entity';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { User } from 'src/user/entities/user.entity';
import type { Relation } from 'src/utils/Repository';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExternalShareTarget } from './external-share-target.entity';

@Entity()
@Check(
  '("actionId" IS NOT NULL AND "externalTargetId" IS NULL) OR ("actionId" IS NULL AND "externalTargetId" IS NOT NULL)',
)
@Index('UQ_share_url_user_action', ['user', 'action'], {
  unique: true,
  where: '"actionId" IS NOT NULL',
})
@Index('UQ_share_url_user_external_target', ['user', 'externalTarget'], {
  unique: true,
  where: '"externalTargetId" IS NOT NULL',
})
export class ShareUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @ApiProperty()
  url: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Type(() => User)
  user?: Relation<User>;

  @Column({ nullable: true })
  actionId: number | null;

  @ManyToOne(() => Action, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'actionId' })
  @Type(() => Action)
  action?: Relation<Action> | null;

  @ManyToOne(() => ExternalShareTarget, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'externalTargetId' })
  @Type(() => ExternalShareTarget)
  externalTarget?: Relation<ExternalShareTarget> | null;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  sid?: string;

  @CreateDateColumnTz()
  createdAt: Date;

  @UpdateDateColumnTz()
  updatedAt: Date;

  @Column({ type: 'jsonb' })
  @Type(() => Object)
  @ApiPropertyOptional({ type: Object })
  data?: Record<string, unknown>;
}
