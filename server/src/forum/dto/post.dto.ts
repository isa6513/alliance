import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { ActionDto } from 'src/actions/dto/action.dto';
import { ProfileDto } from '../../user/user.dto';
import { Post } from '../entities/post.entity';
import {
  CreateEditableContentDto,
  EditableContentDto,
} from './editablecontent.dto';

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

  @ApiProperty({ type: () => ProfileDto, isArray: true })
  likes: ProfileDto[];

  constructor(post: Post, commentCount?: number) {
    super();
    Object.assign(this, post);
    this.author = new ProfileDto(post.author);
    this.commentCount = commentCount;
    this.likes = post.likes.map((like) => new ProfileDto(like));
    this.editableContent = new EditableContentDto(post.editableContent);
    this.createdAt = post.visibleAt ?? post.createdAt;
  }
}

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
