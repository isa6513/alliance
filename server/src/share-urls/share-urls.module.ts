import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsModule } from 'src/actions/actions.module';
import { ExternalShareTarget } from './entities/external-share-target.entity';
import { ShareUrl } from './entities/share-url.entity';
import { ExternalShareTargetsController } from './external-share-targets.controller';
import { ExternalShareTargetsService } from './external-share-targets.service';
import { ShareUrlsController } from './share-urls.controller';
import { ShareUrlsService } from './share-urls.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShareUrl, ExternalShareTarget]),
    forwardRef(() => ActionsModule),
  ],
  controllers: [ShareUrlsController, ExternalShareTargetsController],
  providers: [ShareUrlsService, ExternalShareTargetsService],
  exports: [ShareUrlsService],
})
export class ShareUrlsModule {}
