import { ApiProperty } from '@nestjs/swagger';
import { ActionEvent } from 'src/actions/entities/action-event.entity';
import { Mail } from 'src/mail/mail.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationChannel } from '../notifchannel';

@Entity()
export class ActionEventNotif {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActionEvent, (actionEvent) => actionEvent.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'actionEventId' })
  actionEvent: ActionEvent;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    enumName: 'NotificationChannel',
  })
  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel' })
  channel: NotificationChannel;

  @ApiProperty({ nullable: true })
  @OneToOne(() => Mail, { nullable: true })
  @JoinColumn({ name: 'mailId' })
  mail: Mail | null;

  @ManyToOne(() => User, (user) => user.actionEventNotifs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  @ApiProperty({
    description: 'Indicates whether the notification has been sent',
  })
  sent: boolean;
}
