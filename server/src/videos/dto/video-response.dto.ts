import { ApiProperty, PickType } from '@nestjs/swagger';
import { Video } from '../entities/video.entity';

export class UploadVideoResponseDto extends PickType(Video, [
  'id',
  'key',
  'status',
]) {}

export class VideoStatusResponseDto extends PickType(Video, [
  'id',
  'key',
  'status',
  'duration',
]) {}

export class DeleteVideoResponseDto {
  @ApiProperty({ type: Boolean })
  deleted: boolean;
}
