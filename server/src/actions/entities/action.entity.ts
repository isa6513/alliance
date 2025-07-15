import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { UserAction, UserActionRelation } from './user-action.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Allow, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { ActionEvent, ActionStatus } from './action-event.entity';

export enum ActionTaskType {
  Funding = 'Funding', //giving money to a particular cause
  Activity = 'Activity', // one-time action taking a limited amount of time
  Ongoing = 'Ongoing', // ongoing or recurring behavior change
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
    description: 'Number of commitments needed to start the action',
  })
  @IsOptional()
  commitmentThreshold?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Amount of money committed needed to start the action',
  })
  @IsOptional()
  donationThreshold?: number;

  @Column({ default: 500, nullable: true })
  @ApiPropertyOptional({
    description: 'Suggested donation amount (cents)',
  })
  @IsOptional()
  donationAmount?: number;

  @Column()
  @ApiProperty({ description: 'markdown page body' })
  @IsNotEmpty()
  body: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'markdown contents for activity task card (instructions)',
  })
  @IsOptional()
  taskContents?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Short description shown in cards' })
  @IsNotEmpty()
  shortDescription: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  timeEstimate?: string;

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

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the action was created' })
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Timestamp when the action was last updated' })
  @Allow()
  @Type(() => Date)
  updatedAt: Date;

  @OneToMany(() => UserAction, (userAction) => userAction.action)
  @ApiProperty({
    description: 'Relations between users and the action',
    type: () => [UserAction],
    isArray: true,
  })
  @Allow()
  @IsArray()
  @Type(() => UserAction)
  userRelations: UserAction[];

  @OneToMany(() => ActionEvent, (event) => event.action)
  @ApiProperty({
    description: 'Events associated with the action',
    type: () => [ActionEvent],
    isArray: true,
  })
  @Allow()
  @IsArray()
  @Type(() => ActionEvent)
  events: ActionEvent[];

  @Expose()
  @ApiProperty({
    description: 'Number of users who have joined the action',
  })
  get usersJoined(): number {
    return (
      this.userRelations?.filter(
        (ur) =>
          ur.status === UserActionRelation.joined ||
          ur.status === UserActionRelation.completed,
      ).length || 0
    );
  }

  @Expose()
  @ApiProperty({
    description: 'Number of users who have joined the action',
    example: 5,
  })
  get status(): ActionStatus {
    if (!this.events) {
      return ActionStatus.Draft;
    }
    const pastEvents = this.events
      .filter((e) => e.date < new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    if (pastEvents.length === 0) {
      return ActionStatus.Draft;
    }
    return pastEvents[pastEvents.length - 1].newStatus;
  }

  @Expose()
  @ApiProperty({
    description: 'Number of users who have completed the action',
  })
  get usersCompleted(): number {
    return (
      this.userRelations?.filter(
        (ur) => ur.status === UserActionRelation.completed,
      ).length || 0
    );
  }
}
