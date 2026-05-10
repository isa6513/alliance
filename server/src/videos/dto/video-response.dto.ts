import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Video } from '../entities/video.entity';

export class UploadVideoResponseDto extends PickType(Video, [
  'id',
  'key',
  'status',
]) {
  constructor(input: Video) {
    super();
    this.id = input.id;
    this.key = input.key;
    this.status = input.status;
  }
}

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

export class VideoListItemDto extends PickType(Video, [
  'id',
  'key',
  'originalFilename',
  'mime',
  'size',
  'status',
  'duration',
]) {
  @ApiProperty()
  dateCreated: Date;

  @ApiProperty()
  dateUpdated: Date;

  constructor(input: Video) {
    super();
    this.id = input.id;
    this.key = input.key;
    this.originalFilename = input.originalFilename;
    this.mime = input.mime;
    this.size = input.size;
    this.status = input.status;
    this.duration = input.duration;
    this.dateCreated = input.dateCreated;
    this.dateUpdated = input.dateUpdated;
  }
}

export class VideoListResponseDto {
  @ApiProperty({ isArray: true, type: VideoListItemDto })
  videos: VideoListItemDto[];

  constructor(videos: Video[]) {
    this.videos = videos.map((v) => new VideoListItemDto(v));
  }
}

export class VideoSegmentDto {
  @ApiProperty()
  filename: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  key: string;
}

export class VideoProcessingInfoDto {
  @ApiProperty()
  codec: string;

  @ApiProperty()
  preset: string;

  @ApiProperty()
  crf: number;

  @ApiProperty()
  maxrate: string;

  @ApiProperty()
  bufsize: string;

  @ApiProperty()
  scale: string;

  @ApiProperty()
  audioCodec: string;

  @ApiProperty()
  audioBitrate: string;

  @ApiProperty()
  hlsTime: number;
}

export class VideoDetailResponseDto extends PickType(Video, [
  'id',
  'key',
  'originalFilename',
  'mime',
  'size',
  'status',
  'duration',
]) {
  @ApiProperty({ isArray: true, type: VideoSegmentDto })
  segments: VideoSegmentDto[];

  @ApiProperty()
  totalOutputSize: number;

  @ApiPropertyOptional({ type: VideoProcessingInfoDto })
  processingInfo?: VideoProcessingInfoDto;

  @ApiProperty()
  dateCreated: Date;

  @ApiProperty()
  dateUpdated: Date;
}

export class ReplaceVideoResponseDto extends PickType(Video, [
  'id',
  'key',
  'status',
]) {}
