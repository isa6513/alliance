import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Post } from '../entities/post.entity';
import { ProfileDto } from '../../user/user.dto';
import { CommentDto } from './reply.dto';
import { ActionDto } from 'src/actions/dto/action.dto';

// return object for get requests
export class PostDto extends PickType(Post, [
  'id',
  'title',
  'content',
  'actionId',
  'authorId',
  'createdAt',
  'updatedAt',
]) {
  //redefine to use compacted dto types
  @ApiPropertyOptional({ type: () => ActionDto })
  action: ActionDto | undefined;

  @ApiProperty({ type: ProfileDto })
  author: ProfileDto;

  @ApiProperty({ type: Number })
  commentCount: number;

  @ApiProperty({ type: () => CommentDto, isArray: true })
  comments: CommentDto[];

  constructor(post: Post, comments: CommentDto[] = []) {
    super();
    Object.assign(this, post);
    this.author = new ProfileDto(post.author);
    this.comments = comments;
    this.commentCount = this.comments.length;
  }
}

export class CreatePostDto extends PickType(Post, [
  'title',
  'content',
  'actionId',
]) {}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
