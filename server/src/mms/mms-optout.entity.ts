import { ApiProperty } from "@nestjs/swagger";
import { CreateDateColumnTz, UpdateDateColumnTz } from "src/datasources/basecolumns";
import { Ty } from "src/tasks/entities/type";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MmsOptout {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @Column()
    @ApiProperty()
    phoneNumber: string;

    @Column()
    @ApiProperty()
    reason: string;

    @CreateDateColumnTz()
    @ApiProperty()
    createdAt: Date;

    @UpdateDateColumnTz()
    @ApiProperty()
    updatedAt: Date;

    @Column()
    @ApiProperty()
    rawBody: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    @ApiProperty({ type: () => User })
    user: Ty<User>;
}