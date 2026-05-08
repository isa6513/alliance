import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsOptional, ValidateNested } from 'class-validator';
import { ActionDto } from 'src/actions/dto/action.dto';
import { ProfileDto } from '../../user/dto/user.dto';
import { Post } from '../entities/post.entity';
import {
  CreateEditableContentDto,
  EditableContentDto,
} from './editablecontent.dto';
import { CommentDto } from './comment.dto';
import { Comment } from '../entities/comment.entity';

// return object for get requests
export class PostDto extends PickType(Post, [
  'id',
  'title',
  'actionId',
  'authorId',
  'createdAt',
  'visibleAt',
  'updatedAt',
  'pinned',
  'qaMode',
  'deleted',
  'expertIds',
  'expertLabel',
  'authorIds',
  'notifyForReplies',
]) {
  //redefine to use compacted dto types
  @ApiPropertyOptional({ type: () => ActionDto })
  action: ActionDto | undefined;

  @ApiProperty({ type: ProfileDto })
  author: ProfileDto;

  @ApiPropertyOptional({ type: Number })
  commentCount?: number;

  @ApiProperty({ type: () => EditableContentDto })
  editableContent: EditableContentDto;

  @ApiPropertyOptional({ type: () => ProfileDto, isArray: true })
  likes?: ProfileDto[];

  @ApiPropertyOptional({ type: () => CommentDto })
  lastComment?: CommentDto;

  @ApiPropertyOptional({ type: Number })
  likeCount?: number;

  @ApiPropertyOptional({ type: () => ProfileDto, isArray: true })
  experts?: ProfileDto[];

  @ApiPropertyOptional({ type: () => ProfileDto, isArray: true })
  authors?: ProfileDto[];

  constructor({ post, commentCount, lastComment }: PostDtoArgs) {
    super();
    this.id = post.id;
    this.title = post.title;
    this.actionId = post.actionId;
    this.authorId = post.authorId;
    this.createdAt = post.visibleAt ?? post.createdAt;
    this.visibleAt = post.visibleAt;
    this.updatedAt = post.updatedAt;
    this.pinned = post.pinned;
    this.qaMode = post.qaMode;
    this.deleted = post.deleted;
    this.expertIds = post.expertIds;
    this.expertLabel = post.expertLabel;
    this.authorIds = post.authorIds;
    this.notifyForReplies = post.notifyForReplies;
    this.action = post.action ? new ActionDto(post.action) : undefined;
    this.author = new ProfileDto(post.author);
    this.commentCount = commentCount;
    this.editableContent = new EditableContentDto(post.editableContent);
    this.likes = post.likes
      ? post.likes.map((like) => new ProfileDto(like))
      : undefined;
    this.lastComment = lastComment ? new CommentDto(lastComment) : undefined;
    this.likeCount = post.likesIds?.length;
    this.experts = post.experts
      ? post.experts.map((expert) => new ProfileDto(expert))
      : undefined;
    this.authors = post.authors
      ? post.authors.map((author) => new ProfileDto(author))
      : undefined;
  }
}

export type PostDtoArgs = {
  post: Post;
  commentCount?: number;
  lastComment?: Comment;
};

export class CreatePostDto extends PickType(Post, [
  'title',
  'actionId',
  'visibleAt',
]) {
  @ApiProperty({ type: CreateEditableContentDto })
  @ValidateNested()
  @Type(() => CreateEditableContentDto)
  @IsDefined()
  editableContent: CreateEditableContentDto;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class UpdatePostExpertsDto {
  @ApiProperty({ type: Number, isArray: true })
  @IsDefined()
  expertIds: number[];

  @ApiProperty()
  @IsDefined()
  qaMode: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  expertLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  notifyForReplies?: boolean;
}

export class UpdatePostAuthorsDto {
  @ApiProperty({ type: Number, isArray: true })
  @IsDefined()
  authorIds: number[];
}
