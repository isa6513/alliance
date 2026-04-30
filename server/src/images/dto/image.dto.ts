import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Image } from '../entities/image.entity';

export class UploadImageDto {
  @ApiProperty()
  @IsNotEmpty()
  file: string;
}

export class ImageResponseDto extends PickType(Image, ['key', 'id']) {}

export class ImageDataDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  contents: string;
}

export class DeleteImageResponseDto {
  @ApiProperty({ type: Boolean })
  deleted: boolean;
}

export class UploadImageResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  key: string;
}
