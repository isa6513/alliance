import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { UpdateDateColumnTz } from 'src/datasources/basecolumns';
import { Ty } from 'src/tasks/entities/type';
import { Tag } from 'src/user/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionActivity } from './action-activity.entity';
import { ActionEvent, ActionStatus } from './action-event.entity';
import { ActionSuite } from './action-suite.entity';
import { ActionUpdate } from './action-update.entity';
import { findLeast } from 'src/utils/filter';

export enum ActionTaskType {
  Funding = 'Funding', //giving money to a particular cause
  Activity = 'Activity', // one-time action taking a limited amount of time
  Ongoing = 'Ongoing', // ongoing or recurring behavior change
}

export enum VisibilityMode {
  Public = 'public',
  AllMembers = 'all_members',
  ParticipatingGroups = 'participating_groups',
}

@Entity()
export class Action {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the action' })
  @Allow()
  id: number;

  @Column()
  @ApiProperty({ description: 'Name of the action' })
  @IsNotEmpty()
  name: string;

  @Column()
  @ApiProperty({ description: 'Category of the action' })
  @IsNotEmpty()
  category: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Image URL for the action' })
  @IsOptional()
  image?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Square thumbnail image URL for the action',
  })
  @IsOptional()
  squareThumbnailImage?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Square thumbnail image alt for the action',
  })
  @IsOptional()
  squareThumbnailImageAlt?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Number of commitments needed to start the action',
  })
  @IsOptional()
  commitmentThreshold?: number;

  @Column({ default: 500, nullable: true })
  @ApiPropertyOptional({
    description: 'Suggested donation amount (cents)',
  })
  @IsOptional()
  donationAmount?: number;

  @Column({ default: false })
  @ApiProperty({
    description: 'e.g. onboarding',
  })
  @IsNotEmpty()
  commitmentless: boolean;

  @Column()
  @ApiProperty({ description: 'markdown page body' })
  @Allow()
  body: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'markdown contents for activity task card (instructions)',
  })
  @IsOptional()
  taskContents?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Short description shown in cards' })
  @Allow()
  shortDescription: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Time estimate in minutes' })
  @IsOptional()
  timeEstimate?: number;

  @Column({
    type: 'enum',
    enum: ActionTaskType,
    default: ActionTaskType.Activity,
  })
  @ApiProperty({
    description: 'Type of the action',
    enum: ActionTaskType,
    enumName: 'ActionTaskType',
  })
  @IsNotEmpty()
  type: ActionTaskType;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Form associated with the action' })
  @IsOptional()
  taskFormId?: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the action was created' })
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @UpdateDateColumnTz()
  @ApiProperty({ description: 'Timestamp when the action was last updated' })
  @Allow()
  @Type(() => Date)
  updatedAt: Date;

  @OneToMany(() => ActionEvent, (event) => event.action)
  @ApiProperty({
    description: 'Events associated with the action',
    type: () => ActionEvent,
    isArray: true,
  })
  @Allow()
  @IsArray()
  @Type(() => ActionEvent)
  events: Ty<ActionEvent>[];

  @ManyToMany(() => Tag, (tag) => tag.participatingIn, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => Tag, isArray: true })
  @Allow()
  @JoinTable()
  @Type(() => Tag)
  participatingTags: Tag[];

  @IsOptional()
  private _participatingTagIdSet: Set<number> | null = null;
  get participatingTagIdSet(): Set<number> {
    if (this._participatingTagIdSet === null) {
      this._participatingTagIdSet = new Set(
        this.participatingTags.map((t) => t.id),
      );
    }
    return this._participatingTagIdSet;
  }

  @Column({ default: false })
  @ApiProperty({
    description: 'Whether to use a manual cohort for the action',
  })
  @IsDefined()
  useManualCohort: boolean;

  @Column('int', { array: true, nullable: true })
  @Allow()
  @ApiPropertyOptional({
    description: 'User IDs in the manual cohort',
    type: Number,
    isArray: true,
  })
  @IsOptional()
  manualCohortUserIds?: number[];

  @IsOptional()
  private _manualCohortUserIdSet: Set<number> | undefined | null = null;
  get manualCohortUserIdSet(): Set<number> | undefined {
    if (this._manualCohortUserIdSet === null) {
      this._manualCohortUserIdSet = this.manualCohortUserIds
        ? new Set(this.manualCohortUserIds)
        : undefined;
    }
    return this._manualCohortUserIdSet;
  }

  @Column({
    type: 'enum',
    enum: VisibilityMode,
    default: VisibilityMode.Public,
  })
  @ApiProperty({ enum: VisibilityMode, enumName: 'VisibilityMode' })
  @IsDefined()
  visibilityMode: VisibilityMode;

  @Column({ default: 0 })
  @ApiProperty()
  @Allow()
  usersJoined: number;

  @Column({ default: 0 })
  @ApiProperty({
    description: 'Number of users who have completed the action',
  })
  @Allow()
  usersCompleted: number;

  @OneToMany(() => ActionActivity, (activity) => activity.action)
  @ApiProperty({
    description: 'Activities associated with the action',
    type: () => [ActionActivity],
    isArray: true,
  })
  @Allow()
  @IsArray()
  @Type(() => ActionActivity)
  activities: ActionActivity[];

  @IsOptional()
  private _status: ActionStatus | null = null;
  @Expose()
  @ApiProperty({ enum: ActionStatus, enumName: 'ActionStatus' })
  get status(): ActionStatus {
    if (this._status === null) {
      if (!this.events) {
        throw new Error('Action has no events');
      }

      const mostRecentPastEvent = findLeast(
        this.events.sort((a, b) => a.date.getTime() - b.date.getTime()),
        (a, b) => b.date.getTime() - a.date.getTime(), // reverse order
        (event) => event.date < new Date(),
      );
      this._status = mostRecentPastEvent
        ? mostRecentPastEvent.newStatus
        : ActionStatus.Draft;
    }

    return this._status;
  }

  @IsOptional()
  private _latestMemberActionEvent:
    | { event: ActionEvent; deadline: Date | null }
    | {
        event: null;
        deadline: null;
      }
    | null = null;
  get latestMemberActionEvent(): typeof this._latestMemberActionEvent {
    populateCache: if (this._latestMemberActionEvent !== null) {
      if (!this.events) {
        throw new Error('Action has no events');
      }

      const latestMemberActionEvent = findLeast(
        this.events,
        (a, b) => b.date.getTime() - a.date.getTime(), // reverse order
      );
      if (!latestMemberActionEvent) {
        this._latestMemberActionEvent = {
          event: null,
          deadline: null,
        };
        break populateCache;
      }

      const latestMemberActionDeadline = findLeast(
        this.events,
        (a, b) => a.date.getTime() - b.date.getTime(),
        (event) =>
          event.newStatus !== ActionStatus.MemberAction &&
          event.date >= latestMemberActionEvent.date,
      );

      return {
        event: latestMemberActionEvent,
        deadline: latestMemberActionDeadline?.date ?? null,
      };
    }
    return this._latestMemberActionEvent;
  }

  @Column({ default: false })
  @ApiProperty({
    description:
      'Override default contract signing requirements for showing in tasks (e.g. for onboarding actions)',
    default: false,
  })
  @Allow()
  everyoneShouldComplete: boolean;

  @Column({ default: false })
  @ApiProperty({
    default: false,
  })
  @Allow()
  archived: boolean;

  @OneToMany(() => ActionUpdate, (update) => update.action)
  @ApiProperty({
    type: () => ActionUpdate,
    isArray: true,
  })
  @Allow()
  @Type(() => ActionUpdate)
  updates: ActionUpdate[];

  @ManyToOne(() => ActionSuite, (suite) => suite.actions, { nullable: true })
  @ApiPropertyOptional({ type: () => ActionSuite })
  @Type(() => ActionSuite)
  @IsOptional()
  suite?: ActionSuite | null;

  @Column({ default: 0 })
  @ApiProperty({ description: 'Priority of the action' })
  @IsDefined()
  priority: number;

  @Column({ default: false })
  @ApiProperty()
  @Allow()
  optional: boolean;

  @Column({ default: false })
  @ApiProperty({
    description: 'Prevent completion of the action (for old actions)',
  })
  @Allow()
  preventCompletion: boolean;

  @Column({ default: false })
  @ApiProperty({
    description:
      'Whether the action is visible to and supposed to only be completed by non-members',
  })
  @Allow()
  publicOnly: boolean;

  @Column({ default: false })
  @ApiProperty({
    description:
      'Whether the action shows up in the tasks page after the deadline',
  })
  @Allow()
  shouldCompleteAfterDeadline: boolean;

  @ManyToMany(() => User, (user) => user.authoredActions, { cascade: true })
  @JoinTable()
  @ApiPropertyOptional({ type: () => User, isArray: true })
  @Type(() => User)
  @IsOptional()
  authors?: Ty<User>[];
}
