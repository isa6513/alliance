import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { formatDistanceToNow } from 'date-fns';
import { ActionsService } from 'src/actions/actions.service';
import { readableActionStatus } from 'src/actions/entities/action-event.entity';
import { Action } from 'src/actions/entities/action.entity';
import { Post } from 'src/forum/entities/post.entity';
import { ForumService } from 'src/forum/forum.service';
import { ProfileDto } from 'src/user/user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { actionUrl, postUrl, profileUrl } from './approutes';
import { RecentSearch } from './recentsearch.entity';
import { SearchItemDto, SearchItemType } from './searchitem.dto';

@Injectable()
export class SearchService {
  constructor(
    private usersService: UserService,
    private actionsService: ActionsService,
    private forumService: ForumService,
    @InjectRepository(RecentSearch)
    private searchRepository: Repository<RecentSearch>,
  ) {}

  async search(query: string, userId: number): Promise<SearchItemDto[]> {
    const maxItemsPerType = 5;

    if (!query.length) {
      const recentSearches = await this.searchRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: maxItemsPerType,
      });

      for (let i = recentSearches.length - 1; i >= 0; i--) {
        if (
          recentSearches
            .slice(0, i)
            .some(
              (search) =>
                search?.objectId === recentSearches[i].objectId &&
                search?.objectType === recentSearches[i].objectType,
            )
        ) {
          recentSearches.splice(i, 1);
        }
      }

      const recentSearchesItems = await Promise.all(
        recentSearches.map(async (search): Promise<SearchItemDto | null> => {
          if (search.objectType === SearchItemType.User) {
            const user = await this.usersService.findOne(search.objectId);
            if (!user) {
              return null;
            }
            return this.userToSearchItem(user, false, false);
          } else if (search.objectType === SearchItemType.Action) {
            const action = await this.actionsService.findOne(search.objectId);
            return this.actionToSearchItem(action);
          } else if (search.objectType === SearchItemType.Post) {
            const post = await this.forumService.findOnePost(search.objectId);
            if (post.deleted) {
              return null;
            }
            return this.postToSearchItem(post);
          }
          return null;
        }),
      );

      return recentSearchesItems.filter((item) => item !== null);
    }

    const users = await this.usersService.findByUsername(query);
    const friends = await this.usersService.findFriends(userId);
    const userItems = users.slice(0, maxItemsPerType).map((user) =>
      this.userToSearchItem(
        user,
        friends.some((f) => f.id === user.id),
        user.id === userId,
      ),
    );

    const actions = await this.actionsService.findByName(query);
    const actionItems = actions
      .slice(0, maxItemsPerType)
      .map((action) => this.actionToSearchItem(action));

    const posts = await this.forumService.findPostsByTitle(query);
    const postItems = posts
      .slice(0, maxItemsPerType)
      .map((post) => this.postToSearchItem(post));

    return [...userItems, ...actionItems, ...postItems];
  }

  userToSearchItem(user: User, friends: boolean, self: boolean): SearchItemDto {
    const profile = new ProfileDto(user);
    return {
      id: 'u' + user.id,
      name: profile.displayName,
      type: SearchItemType.User,
      webAppLocation: profileUrl(user.id),
      image: profile.profilePicture,
      secondaryData: friends ? ['Friend'] : self ? ['This is you!'] : [],
    };
  }
  actionToSearchItem(action: Action): SearchItemDto {
    return {
      id: 'a' + action.id,
      name: action.name,
      type: SearchItemType.Action,
      webAppLocation: actionUrl(action.id),
      secondaryData: [readableActionStatus[action.status]],
    };
  }
  postToSearchItem(post: Post): SearchItemDto {
    return {
      id: 'p' + post.id,
      name: post.title,
      type: SearchItemType.Post,
      webAppLocation: postUrl(post.id),
      secondaryData: [formatDistanceToNow(post.createdAt, { addSuffix: true })],
    };
  }

  async saveSelected(item: SearchItemDto, userId: number): Promise<void> {
    const existing = await this.searchRepository.findOne({
      where: {
        objectId: parseInt(item.id.slice(1)),
        objectType: item.type,
        userId,
      },
    });
    if (existing) {
      await this.searchRepository.delete(existing.id);
    }
    await this.searchRepository.save({
      objectId: parseInt(item.id.slice(1)),
      objectType: item.type,
      userId,
    });
  }
}
