import { Injectable } from '@nestjs/common';
import { ActionsService } from 'src/actions/actions.service';
import { ForumService } from 'src/forum/forum.service';
import { UserService } from 'src/user/user.service';
import { SearchItemDto, SearchItemType } from './searchitem.dto';
import { User } from 'src/user/user.entity';
import { Action } from 'src/actions/entities/action.entity';
import { Post } from 'src/forum/entities/post.entity';

@Injectable()
export class SearchService {
  constructor(
    private usersService: UserService,
    private actionsService: ActionsService,
    private forumService: ForumService,
  ) {}

  async search(query: string, userId: number): Promise<SearchItemDto[]> {
    const maxItemsPerType = 5;

    const users = query.length
      ? await this.usersService.findByUsername(query)
      : [];
    const userItems = users
      .slice(0, maxItemsPerType)
      .map((user) => this.userToSearchItem(user));

    const actions = query.length
      ? await this.actionsService.findByName(query)
      : [];
    const actionItems = actions
      .slice(0, maxItemsPerType)
      .map((action) => this.actionToSearchItem(action));
    const posts = query.length
      ? await this.forumService.findPostsByTitle(query)
      : [];
    const postItems = posts
      .slice(0, maxItemsPerType)
      .map((post) => this.postToSearchItem(post));

    return [...userItems, ...actionItems, ...postItems];
  }

  userToSearchItem(user: User): SearchItemDto {
    return {
      id: 'user' + user.id,
      name: user.name,
      type: SearchItemType.User,
      webAppLocation: `/user/${user.id}`,
      image: user.profilePicture,
    };
  }
  actionToSearchItem(action: Action): SearchItemDto {
    return {
      id: 'action' + action.id,
      name: action.name,
      type: SearchItemType.Action,
      webAppLocation: `/actions/${action.id}`,
    };
  }
  postToSearchItem(post: Post): SearchItemDto {
    return {
      id: 'post' + post.id,
      name: post.title,
      type: SearchItemType.Post,
      webAppLocation: `/forum/post/${post.id}`,
    };
  }
}
