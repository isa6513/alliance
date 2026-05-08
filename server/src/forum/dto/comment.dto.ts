import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ProfileDto } from 'src/user/dto/user.dto';
import { Comment } from '../entities/comment.entity';
import {
  CreateEditableContentDto,
  EditableContentDto,
} from './editablecontent.dto';

export class CommentDto extends PickType(Comment, [
  'id',
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

  @ApiProperty({ type: () => EditableContentDto })
  editableContent: EditableContentDto;

  constructor(comment: Comment) {
    super();
    this.id = comment.id;
    this.parentObjectId = comment.parentObjectId;
    this.parentId = comment.parentId;
    this.parentObjectType = comment.parentObjectType;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.deleted = comment.deleted;
    this.pinned = comment.pinned;
    this.author = new ProfileDto(comment.author);
    this.children = comment.children
      ? comment.children.map((child) => new CommentDto(child))
      : undefined;
    this.likes = (comment.likes ?? []).map((like) => new ProfileDto(like));
    this.editableContent = new EditableContentDto(comment.editableContent);
  }
}

export class UserCommentDto extends CommentDto {
  @ApiPropertyOptional()
  parentTitle?: string;

  constructor({ comment, parentTitle }: UserComment) {
    super(comment);
    this.parentTitle = parentTitle;
  }
}

export type UserComment = { comment: Comment; parentTitle?: string };

export class CreateCommentDto extends PickType(Comment, [
  'parentObjectId',
  'parentId',
  'parentObjectType',
]) {
  @ApiProperty({ type: CreateEditableContentDto })
  @ValidateNested()
  @Type(() => CreateEditableContentDto)
  editableContent: CreateEditableContentDto;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
