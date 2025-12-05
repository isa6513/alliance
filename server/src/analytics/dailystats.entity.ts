import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['dayId'])
export class DailyStatsRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayId: string;

  @Column()
  date: Date;

  @Column()
  signedMembers: number;

  @Column()
  suspendedMembers: number;

  @Column()
  actionsCompleted: number;

  @Column()
  invitesCreated: number;

  @Column()
  invitesAccepted: number;
}
