import { Module, forwardRef } from '@nestjs/common';
import { AdminViewerService } from './admin-viewer.service';
import { AdminViewerController } from './admin-viewer.controller';
import { AdminViewerGateway } from './admin-viewer.gateway';
import { DatabaseListenerService } from './database-listener.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([User])],
  controllers: [AdminViewerController],
  providers: [AdminViewerService, AdminViewerGateway, DatabaseListenerService],
})
export class AdminViewerModule { }
