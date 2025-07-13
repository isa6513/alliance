import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Reply } from '../entities/reply.entity';
import { UserDto } from '../../user/user.dto';

// return object for get requests
export class ReplyDto extends PickType(Reply, [
  'id',
  'content',
  'postId',
  'parentId',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({ type: UserDto })
  author: UserDto;

  @ApiProperty({ type: () => [ReplyDto], required: false })
  children?: ReplyDto[];
}

export class CreateReplyDto extends PickType(Reply, [
  'content',
  'postId',
  'parentId',
]) {}

export class UpdateReplyDto extends PartialType(CreateReplyDto) {}
