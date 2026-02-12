import {
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { basename } from 'path';
import { Readable } from 'stream';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { VideosService } from './videos.service';
import {
  DeleteVideoResponseDto,
  ReplaceVideoResponseDto,
  UploadVideoResponseDto,
  VideoDetailResponseDto,
  VideoListResponseDto,
  VideoProcessingInfoDto,
  VideoStatusResponseDto,
} from './dto/video-response.dto';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) { }

  private readonly bucket = process.env.ASSETS_BUCKET!;

  @Post('upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 500 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: UploadVideoResponseDto })
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadVideoResponseDto> {
    const video = await this.videosService.uploadVideo(file);
    return { id: video.id, key: video.key, status: video.status };
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: VideoListResponseDto })
  async listVideos(): Promise<VideoListResponseDto> {
    const videos = await this.videosService.listVideos();
    return {
      videos: videos.map((v) => ({
        id: v.id,
        key: v.key,
        originalFilename: v.originalFilename,
        mime: v.mime,
        size: v.size,
        status: v.status,
        duration: v.duration,
        dateCreated: v.dateCreated,
        dateUpdated: v.dateUpdated,
      })),
    };
  }

  @Get(':id/status')
  @ApiOkResponse({ type: VideoStatusResponseDto })
  async getVideoStatus(
    @Param('id') id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VideoStatusResponseDto> {
    const video = await this.videosService.getVideo(id);
    if (!video) throw new NotFoundException();
    res.setHeader('Cache-Control', 'no-store');
    return {
      id: video.id,
      key: video.key,
      status: video.status,
      duration: video.duration,
    };
  }

  @Get(':id/details')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: VideoDetailResponseDto })
  async getVideoDetails(
    @Param('id') id: number,
  ): Promise<VideoDetailResponseDto> {
    const result = await this.videosService.getVideoDetails(id);
    if (!result) throw new NotFoundException();

    const { video, segments, totalOutputSize } = result;

    return {
      id: video.id,
      key: video.key,
      originalFilename: video.originalFilename,
      mime: video.mime,
      size: video.size,
      status: video.status,
      duration: video.duration,
      segments,
      totalOutputSize,
      processingInfo: (video.processingInfo as unknown as VideoProcessingInfoDto) ?? undefined,
      dateCreated: video.dateCreated,
      dateUpdated: video.dateUpdated,
    };
  }

  @Post(':id/replace')
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('files', 200, { limits: { fileSize: 500 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiOkResponse({ type: ReplaceVideoResponseDto })
  async replaceVideo(
    @Param('id') id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ReplaceVideoResponseDto> {
    const video = await this.videosService.replaceVideoContent(id, files);
    if (!video) throw new NotFoundException();
    return { id: video.id, key: video.key, status: video.status };
  }

  @Get(':id/:filename')
  @ApiOkResponse()
  async streamVideoFile(
    @Param('id') id: number,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const video = await this.videosService.getVideo(id);
    if (!video) throw new NotFoundException();

    const s3Key = `${video.key}/${filename}`;
    const ac = new AbortController();

    res.on('close', () => ac.abort());
    res.on('error', () => ac.abort());

    try {
      const out = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: s3Key }),
        { abortSignal: ac.signal },
      );

      const body = out.Body as Readable | undefined;
      if (!body) throw new NotFoundException();

      const contentType = filename.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : filename.endsWith('.ts')
          ? 'video/MP2T'
          : out.ContentType ?? 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${basename(filename)}"`,
      );
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      body.on('error', () => {
        try {
          body.destroy();
        } catch { }
        if (!res.headersSent) res.status(500);
        res.end();
      });

      body.pipe(res);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: DeleteVideoResponseDto })
  async deleteVideo(
    @Param('id') id: number,
  ): Promise<DeleteVideoResponseDto> {
    const video = await this.videosService.getVideo(id);
    if (!video) throw new NotFoundException();
    await this.videosService.deleteVideo(id);
    return { deleted: true };
  }
}
