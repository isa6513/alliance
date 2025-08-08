import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ActionsModule } from 'src/actions/actions.module';
import { ForumModule } from 'src/forum/forum.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecentSearch } from './recentsearch.entity';

@Module({
  imports: [
    UserModule,
    ActionsModule,
    ForumModule,
    TypeOrmModule.forFeature([RecentSearch]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
