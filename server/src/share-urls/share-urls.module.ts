import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from 'src/actions/entities/action.entity';
import { ExternalShareTarget } from './entities/external-share-target.entity';
import { ShareUrl } from './entities/share-url.entity';
import { ExternalShareTargetsController } from './external-share-targets.controller';
import { ExternalShareTargetsService } from './external-share-targets.service';
import { ShareUrlsController } from './share-urls.controller';
import { ShareUrlsService } from './share-urls.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShareUrl, ExternalShareTarget, Action])],
  controllers: [ShareUrlsController, ExternalShareTargetsController],
  providers: [ShareUrlsService, ExternalShareTargetsService],
  exports: [ShareUrlsService],
})
export class ShareUrlsModule {}
