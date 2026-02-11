import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  private readonly bucket = process.env.ASSETS_BUCKET!;

  async uploadVideo(file: Express.Multer.File): Promise<Video> {
    const key = `videos/${Date.now()}`;
    const video = await this.videoRepository.save(
      this.videoRepository.create({
        key,
        originalFilename: file.originalname,
        mime: file.mimetype,
        size: file.size,
        status: 'processing',
      }),
    );

    // Fire-and-forget processing
    void this.processVideo(video, file.buffer);

    return video;
  }

  private async processVideo(video: Video, buffer: Buffer): Promise<void> {
    const tmpDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'video-'),
    );
    const inputPath = path.join(tmpDir, 'input');
    const outputDir = path.join(tmpDir, 'output');

    try {
      await fs.promises.mkdir(outputDir, { recursive: true });
      await fs.promises.writeFile(inputPath, buffer);

      // Run ffmpeg to produce HLS segments
      await this.runFfmpeg(inputPath, outputDir);

      // Extract duration (best-effort)
      const duration = await this.getDuration(inputPath).catch(() => undefined);

      // Upload all output files to S3
      const files = await fs.promises.readdir(outputDir);
      await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(outputDir, filename);
          const fileBuffer = await fs.promises.readFile(filePath);
          const contentType = filename.endsWith('.m3u8')
            ? 'application/vnd.apple.mpegurl'
            : 'video/MP2T';

          await this.s3.send(
            new PutObjectCommand({
              Bucket: this.bucket,
              Key: `${video.key}/${filename}`,
              Body: fileBuffer,
              ContentType: contentType,
            }),
          );
        }),
      );

      await this.videoRepository.update(video.id, {
        status: 'ready',
        duration,
      });
    } catch (err) {
      this.logger.error(`Failed to process video ${video.id}`, err);
      await this.videoRepository.update(video.id, { status: 'failed' });
    } finally {
      // Clean up temp dir
      await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private runFfmpeg(inputPath: string, outputDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(outputDir, 'playlist.m3u8');
      const proc = spawn('ffmpeg', [
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-c:a',
        'aac',
        '-hls_time',
        '6',
        '-hls_list_size',
        '0',
        '-hls_segment_filename',
        path.join(outputDir, 'segment_%03d.ts'),
        outputPath,
      ]);

      let stderr = '';
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
        }
      });

      proc.on('error', reject);
    });
  }

  private getDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const proc = spawn('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        inputPath,
      ]);

      let stdout = '';
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          const duration = parseFloat(stdout.trim());
          if (!isNaN(duration)) {
            resolve(duration);
          } else {
            reject(new Error('Could not parse duration'));
          }
        } else {
          reject(new Error(`ffprobe exited with code ${code}`));
        }
      });

      proc.on('error', reject);
    });
  }

  async getVideo(id: number): Promise<Video | null> {
    return this.videoRepository.findOneBy({ id });
  }

  async deleteVideo(id: number): Promise<boolean> {
    const video = await this.getVideo(id);
    if (!video) return false;

    // Delete all S3 objects under the video's key prefix
    const listResult = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: `${video.key}/`,
      }),
    );

    if (listResult.Contents && listResult.Contents.length > 0) {
      await Promise.all(
        listResult.Contents.map((obj) =>
          this.s3.send(
            new DeleteObjectCommand({
              Bucket: this.bucket,
              Key: obj.Key!,
            }),
          ),
        ),
      );
    }

    await this.videoRepository.delete(id);
    return true;
  }
}

export function getVideoSource(key: string): string {
  if (typeof key !== 'string') return '';

  if (key.startsWith('http')) return key;

  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
  ) {
    if (
      process.env.USE_CLOUDFRONT === 'true' &&
      process.env.CLOUDFRONT_DOMAIN
    ) {
      return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
    }
    return `${process.env.APP_URL}/api/videos/${key}`;
  } else {
    return `http://localhost:3005/videos/${key}`;
  }
}
