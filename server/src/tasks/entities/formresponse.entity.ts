// src/forms/form-response.entity.ts
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Form } from './form.entity';

@Entity()
export class FormResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  formId: number;

  @ManyToOne(() => Form, (f) => f.responses, { onDelete: 'CASCADE' })
  form: Form;

  @Column({ type: 'jsonb' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: Record<string, any>;

  @ManyToOne(() => User, (u) => u.formResponses, { onDelete: 'CASCADE' })
  user: User;
}
