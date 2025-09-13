import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Mms {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column()
  body: string;

  @Column()
  status: string;

  @Column()
  twilioSid: string;

  @Column({ nullable: true })
  errorCode?: number;

  @Column({ nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
