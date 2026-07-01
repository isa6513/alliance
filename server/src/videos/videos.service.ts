import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { VideoDetailResponse } from './dto/video-response.dto';
import { Video } from './entities/video.entity';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  private readonly bucket = process.env.ASSETS_BUCKET!;

  private contentTypeForFile(filename: string) {
    if (filename.endsWith('.m3u8')) {
      return 'application/vnd.apple.mpegurl';
    } else if (filename.endsWith('.vtt')) {
      return 'text/vtt';
    }
    return 'video/MP2T';
  }

  private async putFiles(
    keyPrefix: string,
    files: Express.Multer.File[],
  ): Promise<void> {
    await Promise.all(
      files.map((file) =>
        this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: `${keyPrefix}/${file.originalname}`,
            Body: file.buffer,
            ContentType: this.contentTypeForFile(file.originalname),
          }),
        ),
      ),
    );
  }

  private async deletePrefix(keyPrefix: string): Promise<void> {
    const listResult = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: `${keyPrefix}/`,
      }),
    );
    const contents = listResult.Contents ?? [];
    if (contents.length === 0) return;

    await Promise.all(
      contents.map((obj) =>
        this.s3.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: obj.Key! }),
        ),
      ),
    );
  }

  async uploadVideo(files: Express.Multer.File[]): Promise<Video> {
    const key = `videos/${Date.now()}`;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const playlist = files.find(
      (f) =>
        f.originalname.endsWith('.m3u8') && !f.originalname.includes('_vtt'),
    );

    // Upload to S3 before persisting: a failed upload throws before any Video
    // row exists, so no phantom `ready` row points at an empty key.
    try {
      await this.putFiles(key, files);
    } catch (err) {
      this.logger.error(`Video upload to S3 failed for ${key}`, err as Error);
      // Best-effort cleanup of objects that landed before the failure.
      await this.deletePrefix(key).catch(() => undefined);
      throw err;
    }

    return this.videoRepository.save(
      this.videoRepository.create({
        key,
        originalFilename: playlist?.originalname ?? files[0].originalname,
        mime: 'application/vnd.apple.mpegurl',
        size: totalSize,
        status: 'ready',
      }),
    );
  }

  async getVideo(id: number): Promise<Video | null> {
    return this.videoRepository.findOneBy({ id });
  }

  async listVideos(): Promise<Video[]> {
    return this.videoRepository.find({ order: { dateCreated: 'DESC' } });
  }

  async getVideoDetails(id: number): Promise<VideoDetailResponse | null> {
    const video = await this.videoRepository.findOneBy({ id });
    if (!video) return null;

    const listResult = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: `${video.key}/`,
      }),
    );

    const segments = (listResult.Contents ?? []).map((obj) => ({
      filename: obj.Key!.split('/').pop()!,
      size: obj.Size ?? 0,
      key: obj.Key!,
    }));

    const totalOutputSize = segments.reduce((sum, seg) => sum + seg.size, 0);

    return { video, segments, totalOutputSize };
  }

  async replaceVideoContent(
    id: number,
    files: Express.Multer.File[],
  ): Promise<Video | null> {
    const video = await this.videoRepository.findOneBy({ id });
    if (!video) return null;

    // Upload replacements first, then remove stale objects — a failed replace
    // can't wipe the existing video.
    try {
      await this.putFiles(video.key, files);
    } catch (err) {
      this.logger.error(
        `Video replace upload to S3 failed for ${video.key}`,
        err as Error,
      );
      throw err;
    }

    // Delete prior-version objects the new upload didn't overwrite (same-named
    // files were already replaced by putFiles above).
    const newFilenames = new Set(files.map((f) => f.originalname));
    const listResult = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: `${video.key}/`,
      }),
    );
    const staleObjects = (listResult.Contents ?? []).filter(
      (obj) => !newFilenames.has(obj.Key!.split('/').pop()!),
    );
    await Promise.all(
      staleObjects.map((obj) =>
        this.s3.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: obj.Key! }),
        ),
      ),
    );

    await this.videoRepository.update(video.id, {
      status: 'ready',
      processingInfo: null,
    });
    return this.videoRepository.findOneBy({ id });
  }

  async deleteVideo(id: number): Promise<boolean> {
    const video = await this.getVideo(id);
    if (!video) return false;

    await this.deletePrefix(video.key);

    await this.videoRepository.delete(id);
    return true;
  }
}

export function getVideoSource(key: string): string {
  // An empty/whitespace key must not become a bare-origin URL like
  // `https://<cloudfront-domain>/` — the player would then append
  // `/playlist.m3u8` and request a nonexistent bucket-root object (403).
  if (typeof key !== 'string' || key.trim() === '') return '';

  if (key.startsWith('http')) return key;

  if (process.env.USE_CLOUDFRONT === 'true' && process.env.CLOUDFRONT_DOMAIN) {
    return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
  }

  return key;
}
