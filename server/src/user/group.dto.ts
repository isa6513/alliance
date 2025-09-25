import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Group } from './entities/group.entity';
import { ProfileDto } from './user.dto';
import { Type } from 'class-transformer';
import { Allow, IsNumber } from 'class-validator';

export class GroupDto extends OmitType(Group, ['users', 'participatingIn']) {
  @Allow()
  @ApiProperty({ type: ProfileDto, isArray: true })
  @Type(() => ProfileDto)
  users: ProfileDto[];

  constructor(group: Group) {
    super();
    Object.assign(this, group);
    this.users = group.users.map((user) => new ProfileDto(user));
  }
}

export class CreateGroupDto extends PickType(GroupDto, [
  'name',
  'description',
  'publicDisplayName',
]) {}

export class AddUserToGroupDto {
  @ApiProperty()
  @IsNumber()
  userId: number;
}
