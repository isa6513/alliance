import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ActionsModule } from 'src/actions/actions.module';
import { ForumModule } from 'src/forum/forum.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [UserModule, ActionsModule, ForumModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
