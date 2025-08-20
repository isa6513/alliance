import { Inject, Injectable } from '@nestjs/common';
import { Image } from './entities/image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import * as sharp from 'sharp';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private filesService: FilesService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  private readonly bucket = process.env.ASSETS_BUCKET!; // TODO: separate dev bucket

  async getImages(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async createImage(
    image: Pick<Image, 'key' | 'mime' | 'size'>,
  ): Promise<Image> {
    return this.imageRepository.save(image);
  }

  async getImage(id: number): Promise<Image | null> {
    const image = await this.imageRepository.findOneBy({ id });
    if (!image) {
      console.log('Image not found');
      return null;
    }
    return image;
  }

  async deleteImage(id: number): Promise<boolean> {
    console.log('Deleting image with id:', id);
    const image = await this.getImage(id);

    if (!image) {
      console.log('Image not found');
      return false;
    }
    await this.imageRepository.delete(id);
    await this.filesService.deleteFile(image.key);

    return true;
  }

  async processAndUploadImage(image: string): Promise<string> {
    const spliced = image.substring(image.indexOf(',') + 1);
    const imgBuffer = Buffer.from(spliced, 'base64');
    const processed = await sharp(imgBuffer)
      .resize({ width: 200 })
      .webp({ effort: 3 })
      .toBuffer();

    const key = `${Date.now()}.webp`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: processed,
        ContentType: 'image/webp',
      }),
    );

    return key;
  }
}
