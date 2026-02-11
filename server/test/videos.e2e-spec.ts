import { Readable } from 'stream';
import request from 'supertest';
import { createTestApp, TestContext } from './e2e-test-utils';
import { VideosModule } from '../src/videos/videos.module';
import { Repository } from 'typeorm';
import { Video } from '../src/videos/entities/video.entity';
import {
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

describe('Videos (e2e)', () => {
  let ctx: TestContext;
  let videoRepo: Repository<Video>;
  let mockSend: jest.Mock;

  beforeAll(async () => {
    process.env.ASSETS_BUCKET = 'test-bucket';
    ctx = await createTestApp([VideosModule]);
    videoRepo = ctx.dataSource.getRepository(Video);

    const s3 = ctx.app.get<S3Client>('S3_CLIENT');
    mockSend = jest.fn(async (command) => {
      if (command instanceof GetObjectCommand) {
        return {
          Body: Readable.from(Buffer.from('mock-video-bytes')),
          ContentType: 'video/MP2T',
        };
      }
      // For PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand
      return { Contents: [] };
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s3 as any).send = mockSend;
  }, 50000);

  afterEach(async () => {
    await videoRepo.query('DELETE FROM video');
    mockSend.mockClear();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('uploads a video and returns processing status', async () => {
    const response = await request(ctx.app.getHttpServer())
      .post('/videos/upload')
      .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
      .attach('file', Buffer.from('fake-video-data'), {
        filename: 'test.mp4',
        contentType: 'video/mp4',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      key: expect.stringContaining('videos/'),
      status: 'processing',
    });
  });

  it('returns video status', async () => {
    const video = await videoRepo.save(
      videoRepo.create({
        key: 'videos/test-status',
        originalFilename: 'test.mp4',
        mime: 'video/mp4',
        size: 1000,
        status: 'ready',
        duration: 10.5,
      }),
    );

    const response = await request(ctx.app.getHttpServer())
      .get(`/videos/${video.id}/status`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: video.id,
      key: 'videos/test-status',
      status: 'ready',
      duration: 10.5,
    });
  });

  it('streams HLS files from S3', async () => {
    const video = await videoRepo.save(
      videoRepo.create({
        key: 'videos/test-stream',
        originalFilename: 'test.mp4',
        mime: 'video/mp4',
        size: 1000,
        status: 'ready',
      }),
    );

    await request(ctx.app.getHttpServer())
      .get(`/videos/${video.id}/playlist.m3u8`)
      .expect(200);

    expect(mockSend).toHaveBeenCalledWith(
      expect.any(GetObjectCommand),
      expect.anything(),
    );
  });

  it('returns 404 for non-existent video status', async () => {
    await request(ctx.app.getHttpServer())
      .get('/videos/99999/status')
      .expect(404);
  });

  it('deletes a video', async () => {
    const video = await videoRepo.save(
      videoRepo.create({
        key: 'videos/test-delete',
        originalFilename: 'test.mp4',
        mime: 'video/mp4',
        size: 1000,
        status: 'ready',
      }),
    );

    await request(ctx.app.getHttpServer())
      .delete(`/videos/${video.id}`)
      .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.deleted).toBe(true);
      });

    const deleted = await videoRepo.findOneBy({ id: video.id });
    expect(deleted).toBeNull();
  });

  it('returns 404 when deleting a non-existent video', async () => {
    await request(ctx.app.getHttpServer())
      .delete('/videos/99999')
      .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
      .expect(404);
  });

  it('rejects upload without admin token', async () => {
    await request(ctx.app.getHttpServer())
      .post('/videos/upload')
      .attach('file', Buffer.from('fake-video-data'), {
        filename: 'test.mp4',
        contentType: 'video/mp4',
      })
      .expect(401);
  });
});
