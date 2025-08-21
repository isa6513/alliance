import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Comment } from '../entities/comment.entity';
import { ProfileDto } from 'src/user/user.dto';

// return object for get requests
export class CommentDto extends PickType(Comment, [
  'id',
  'content',
  'parentObjectId',
  'parentId',
  'parentObjectType',
  'createdAt',
  'updatedAt',
  'deleted',
  'pinned',
]) {
  @ApiProperty({ type: ProfileDto })
  author: ProfileDto;

  @ApiPropertyOptional({ type: () => CommentDto, isArray: true })
  children?: CommentDto[];

  @ApiProperty({ type: () => ProfileDto, isArray: true })
  likes: ProfileDto[];

  constructor(comment: Comment) {
    super();
    Object.assign(this, comment);
    this.children = comment.children
      ? comment.children.map((child) => new CommentDto(child))
      : undefined;
    this.author = new ProfileDto(comment.author);
    this.likes = comment.likes.map((like) => new ProfileDto(like));
  }
}

export class CreateCommentDto extends PickType(Comment, [
  'content',
  'parentObjectId',
  'parentId',
  'parentObjectType',
]) {}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
