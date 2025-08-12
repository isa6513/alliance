import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Comment } from '../entities/comment.entity';
import { UserDto } from '../../user/user.dto';

// return object for get requests
export class CommentDto extends PickType(Comment, [
  'id',
  'content',
  'parentObjectId',
  'parentId',
  'createdAt',
  'updatedAt',
  'deleted',
]) {
  @ApiProperty({ type: UserDto })
  author: UserDto;

  @ApiPropertyOptional({ type: () => CommentDto, isArray: true })
  children?: CommentDto[];
}

export class CreateCommentDto extends PickType(Comment, [
  'content',
  'parentObjectId',
  'parentId',
]) {}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
