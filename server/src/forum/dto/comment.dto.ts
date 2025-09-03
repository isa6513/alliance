import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ProfileDto } from 'src/user/user.dto';
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
    Object.assign(this, comment);
    this.children = comment.children
      ? comment.children.map((child) => new CommentDto(child))
      : undefined;
    this.author = new ProfileDto(comment.author);
    this.likes = comment.likes.map((like) => new ProfileDto(like));
    this.editableContent = new EditableContentDto(comment.editableContent);
  }
}

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
