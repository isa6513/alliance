import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Res,
  StreamableFile,
  Param,
  Inject,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { basename } from 'path';
import { Response } from 'express';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  private readonly bucket = process.env.ASSETS_BUCKET!; // TODO: separate dev bucket

  @Get(':key')
  @ApiOkResponse({ type: StreamableFile })
  async getImage(
    @Param('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const { Body, ContentType } = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );

      res.set({
        'Content-Type': ContentType ?? 'application/octet-stream',
        'Content-Disposition': `inline; filename="${basename(key)}"`,
      });
      return new StreamableFile(Body as Readable);
    } catch (error) {
      console.error('Error getting image:', error);
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @ApiOkResponse()
  async deleteImage(@Param('id') id: number) {
    const img = await this.imagesService.getImage(id);
    if (!img) throw new NotFoundException();

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: img.key }),
    );
    await this.imagesService.deleteImage(id);
    return { deleted: true };
  }
}
