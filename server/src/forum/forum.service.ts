import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionActivity } from 'src/actions/entities/action-activity.entity';
import { commentUrl, postUrl } from 'src/search/approutes';
import { ProfileDto } from 'src/user/user.dto';
import { ILike, In, Not, Repository } from 'typeorm';
import {
  Notification,
  NotificationCategory,
} from '../notifs/entities/notification.entity';
import { User } from '../user/entities/user.entity';
import {
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  UserCommentDto,
} from './dto/comment.dto';
import { CreatePostDto, PostDto, UpdatePostDto } from './dto/post.dto';
import { Comment, CommentParentObject } from './entities/comment.entity';
import { EditableContent } from './entities/editablecontent.entity';
import { Post } from './entities/post.entity';
import { Action } from 'src/actions/entities/action.entity';
import { LikeNotificationService } from 'src/notifs/like-notification.service';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Notification)
    private notifRepository: Repository<Notification>,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ActionActivity)
    private actionActivityRepository: Repository<ActionActivity>,
    @InjectRepository(EditableContent)
    private editableContentRepository: Repository<EditableContent>,
    private readonly likeNotificationService: LikeNotificationService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<Post> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const content = this.editableContentRepository.create({
      body: createPostDto.editableContent.body,
      attachments: createPostDto.editableContent.attachments ?? [],
    });
    await this.editableContentRepository.save(content);
    let visibleAt = new Date();
    if (
      createPostDto.visibleAt &&
      new Date(createPostDto.visibleAt) > visibleAt
    ) {
      visibleAt = new Date(createPostDto.visibleAt);
    }
    const post = this.postRepository.create({
      title: createPostDto.title,
      actionId: createPostDto.actionId,
      author: user,
      authorId: user.id,
      editableContent: content,
      visibleAt,
      likes: [],
    });
    return this.postRepository.save(post);
  }

  postIsVisible(post: Post, userId?: number): boolean {
    return (
      (!post.visibleAt ||
        post.visibleAt < new Date() ||
        (userId !== undefined && post.authorId === userId)) &&
      !post.deleted
    );
  }

  async findAllPosts(userId?: number): Promise<PostDto[]> {
    const posts = await this.postRepository.find({
      where: { deleted: false },
      relations: ['author', 'action', 'editableContent'],
      order: { updatedAt: 'DESC' },
    });
    const postsWithComments = await Promise.all(
      posts
        .filter((post) => this.postIsVisible(post, userId))
        .map(async (post) => {
          return this.postWithCommentCount(post);
        }),
    );
    return postsWithComments;
  }

  async postWithCommentCount(post: Post): Promise<PostDto> {
    const commentCount = await this.countCommentsForPost(post.id);
    const lastComment =
      (await this.findLastCommentForPost(post.id)) ?? undefined;
    return new PostDto(post, { commentCount, lastComment });
  }

  async countCommentsForPost(postId: number): Promise<number> {
    return this.commentRepository.count({
      where: {
        parentObjectId: postId,
        parentObjectType: CommentParentObject.Post,
      },
    });
  }

  async findPostsByAction(actionId: number): Promise<Post[]> {
    const posts = (
      await this.postRepository.find({
        where: { actionId, deleted: false },
        relations: ['author', 'action', 'editableContent'],
        order: { updatedAt: 'DESC' },
      })
    ).filter((post) => this.postIsVisible(post));

    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await this.commentRepository.find({
          where: {
            parentObjectId: post.id,
            parentObjectType: CommentParentObject.Post,
          },
        });
        return {
          ...post,
          replies: [],
          replyCount: comments.length,
        };
      }),
    );
    return postsWithComments;
  }

  async findOnePost(id: number, userId?: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'action', 'editableContent'],
    });

    if (!post || !this.postIsVisible(post, userId)) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return post;
  }

  async findCommentsForPost(postId: number): Promise<Comment[]> {
    const allComments = await this.commentRepository.find({
      where: {
        parentObjectId: postId,
        parentObjectType: CommentParentObject.Post,
      },
      relations: ['author', 'editableContent', 'likes'],
      order: { createdAt: 'ASC' },
    });

    return this.organizeRepliesHierarchy(allComments);
  }

  async findLastCommentForPost(postId: number): Promise<Comment | null> {
    const lastComment = await this.commentRepository.findOne({
      where: {
        parentObjectId: postId,
        parentObjectType: CommentParentObject.Post,
        deleted: false,
      },
      relations: ['author', 'editableContent'],
      order: { createdAt: 'DESC' },
    });

    return lastComment;
  }

  async findCommentsForActivity(activityId: number): Promise<Comment[]> {
    const allComments = await this.commentRepository.find({
      where: {
        parentObjectId: activityId,
        parentObjectType: CommentParentObject.Activity,
      },
      relations: ['author', 'editableContent', 'likes'],
      order: { createdAt: 'ASC' },
    });

    return this.organizeRepliesHierarchy(allComments);
  }

  async findCommentsForAction(actionId: number): Promise<Comment[]> {
    const allComments = await this.commentRepository.find({
      where: {
        parentObjectId: actionId,
        parentObjectType: CommentParentObject.Action,
      },
      relations: ['author', 'editableContent', 'likes'],
      order: { createdAt: 'ASC' },
    });

    return this.organizeRepliesHierarchy(allComments);
  }

  private organizeRepliesHierarchy(replies: Comment[]): Comment[] {
    if (replies.length === 0) {
      return [];
    }
    // Create a map for quick lookup
    const replyMap = new Map<number, Comment>();
    const topLevelReplies: Comment[] = [];

    // Initialize all replies with empty children arrays
    replies.forEach((reply) => {
      reply.children = [];
      replyMap.set(reply.id, reply);
    });

    // Organize into hierarchy
    replies.forEach((reply) => {
      if (reply.parentId === null || reply.parentId === undefined) {
        topLevelReplies.push(reply);
      } else {
        const parent = replyMap.get(reply.parentId);
        if (parent) {
          parent.children.push(reply);
        }
      }
    });

    // Sort all levels by creation date
    const sortReplies = (repliesList: Comment[]): Comment[] => {
      return repliesList
        .sort(
          (a, b) =>
            (a.pinned ? 0 : 1) - (b.pinned ? 0 : 1) ||
            a.createdAt.getTime() - b.createdAt.getTime(),
        )
        .map((reply) => ({
          ...reply,
          children: sortReplies(reply.children || []),
        }));
    };

    return sortReplies(topLevelReplies);
  }

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<Post> {
    const post = await this.findOnePost(id, userId);

    if (post.authorId !== userId) {
      throw new NotFoundException('You can only edit your own posts');
    }

    await this.postRepository.update(id, {
      title: updatePostDto.title ?? post.title,
      actionId: updatePostDto.actionId ?? post.actionId,
      visibleAt: updatePostDto.visibleAt ?? post.visibleAt,
    });
    if (updatePostDto.editableContent) {
      const ec = await this.editableContentRepository.findOneBy({
        id: post.editableContent.id,
      });
      if (ec) {
        ec.body = updatePostDto.editableContent.body ?? ec.body;
        ec.attachments =
          updatePostDto.editableContent.attachments ?? ec.attachments;
        await this.editableContentRepository.save(ec);
      }
    }
    return this.findOnePost(id, userId);
  }

  async removePost(id: number, userId: number): Promise<void> {
    const post = await this.findOnePost(id, userId);

    if (post.authorId !== userId) {
      throw new NotFoundException('You can only delete your own posts');
    }

    await this.postRepository.update(id, { deleted: true });
  }

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<CommentDto> {
    // Validate parent reply if provided
    let parentReply: Comment | null = null;
    if (createCommentDto.parentId) {
      parentReply = await this.commentRepository.findOne({
        where: {
          id: createCommentDto.parentId,
          parentObjectId: createCommentDto.parentObjectId,
        },
        relations: ['author'],
      });

      if (!parentReply) {
        throw new NotFoundException(
          `Parent reply with ID "${createCommentDto.parentId}" not found`,
        );
      }
    }

    if (
      !createCommentDto.editableContent.body &&
      (!createCommentDto.editableContent.attachments ||
        createCommentDto.editableContent.attachments.length === 0)
    ) {
      throw new BadRequestException('Reply cannot be empty');
    }

    const content = this.editableContentRepository.create({
      body: createCommentDto.editableContent.body,
      attachments: createCommentDto.editableContent.attachments ?? [],
    });
    await this.editableContentRepository.save(content);

    const reply = this.commentRepository.create({
      ...createCommentDto,
      authorId: userId,
      editableContent: content,
    });

    await this.postRepository.update(createCommentDto.parentObjectId, {
      updatedAt: new Date(),
    });

    await this.commentRepository.save(reply);

    const replyWithAuthor = await this.commentRepository.findOneOrFail({
      where: { id: reply.id },
      relations: ['author', 'editableContent'],
    });

    this.sendNotifsForNewComment(replyWithAuthor);

    return new CommentDto(replyWithAuthor);
  }

  async sendNotifsForNewComment(comment: Comment): Promise<void> {
    const notifications: Notification[] = [];

    const usersToNotify: User[] = [];
    const actionIds: Map<number, number> = new Map();

    if (comment.parentId) {
      const parentReply = await this.commentRepository.findOneOrFail({
        where: { id: comment.parentId, deleted: false },
        relations: ['author'],
      });
      usersToNotify.push(parentReply.author);
    }

    if (comment.parentObjectType === CommentParentObject.Post) {
      const post = await this.postRepository.findOneOrFail({
        where: { id: comment.parentObjectId, deleted: false },
        relations: ['author'],
      });
      usersToNotify.push(post.author);
    }
    if (comment.parentObjectType === CommentParentObject.Activity) {
      const activity = await this.actionActivityRepository.findOneOrFail({
        where: { id: comment.parentObjectId },
        relations: ['user', 'action'],
      });
      usersToNotify.push(activity.user);
      actionIds.set(activity.id, activity.action.id);
    }

    for (const userToNotify of usersToNotify) {
      if (userToNotify.id === comment.authorId) {
        continue;
      }
      const authorDto = new ProfileDto(comment.author);
      const notif = this.notifRepository.create({
        user: userToNotify,
        message: `New reply from ${authorDto.displayName}`,
        category: NotificationCategory.ForumReply,
        webAppLocation: commentUrl(
          comment,
          comment.parentObjectType === CommentParentObject.Activity
            ? actionIds.get(comment.parentObjectId)
            : undefined,
        ),
        associatedUsers: [comment.author],
      });
      notifications.push(notif);
    }
    await this.notifRepository.save(notifications);
  }

  async updateComment(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<Comment> {
    const reply = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'editableContent'],
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${id}" not found`);
    }

    if (reply.authorId !== userId) {
      throw new NotFoundException('You can only edit your own replies');
    }

    if (updateCommentDto.editableContent) {
      const ec = await this.editableContentRepository.findOneBy({
        id: reply.editableContent.id,
      });
      if (ec) {
        ec.body = updateCommentDto.editableContent.body ?? ec.body;
        ec.attachments =
          updateCommentDto.editableContent.attachments ?? ec.attachments;
        await this.editableContentRepository.save(ec);
      }
    }
    const updatedReply = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'editableContent'],
    });

    if (!updatedReply) {
      throw new NotFoundException(
        `Reply with ID "${id}" not found after update`,
      );
    }
    return updatedReply;
  }

  async likePostOrComment(
    id: number,
    userId: number,
    unlike = false,
    type: 'comment' | 'post',
  ): Promise<Comment | Post> {
    const object =
      type === 'comment'
        ? await this.commentRepository.findOne({
            where: { id },
            relations: ['likes', 'author'],
          })
        : await this.postRepository.findOne({
            where: { id },
            relations: ['likes', 'author'],
          });

    if (!object) {
      throw new NotFoundException(`${type} with ID "${id}" not found`);
    }

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    if (unlike) {
      if (!object.likes.some((like) => like.id === userId)) {
        throw new NotFoundException(`User has not liked this ${type}`);
      }

      object.likes = object.likes.filter((like) => like.id !== userId);
    } else {
      if (object.likes.some((like) => like.id === userId)) {
        throw new NotFoundException(`User has already liked this ${type}`);
      }

      object.likes.push(user);
    }
    const obj = await (type === 'comment'
      ? this.commentRepository.save(object)
      : this.postRepository.save(object));

    if (!unlike) {
      if (type === 'comment') {
        await this.sendCommentLikeNotification(object as Comment, user);
      } else {
        await this.sendPostLikeNotification(object as Post, user);
      }
    }

    return obj;
  }

  private async sendPostLikeNotification(post: Post, liker: User) {
    if (!post.author || post.authorId === liker.id) {
      return;
    }
    await this.likeNotificationService.createOrUpdate({
      owner: post.author,
      liker,
      targetType: 'post',
      targetId: post.id,
      webAppLocation: postUrl(post.id),
      groupingKey: `forum_like:post:${post.id}`,
    });
  }

  private async sendCommentLikeNotification(comment: Comment, liker: User) {
    if (!comment.author || comment.authorId === liker.id) {
      return;
    }
    let actionIdForActivity: number | undefined;
    if (comment.parentObjectType === CommentParentObject.Activity) {
      const activity = await this.actionActivityRepository.findOne({
        where: { id: comment.parentObjectId },
      });
      if (!activity) {
        return;
      }
      actionIdForActivity = activity.actionId;
    }
    const webAppLocation = commentUrl(comment, actionIdForActivity);
    if (!webAppLocation) {
      return;
    }
    await this.likeNotificationService.createOrUpdate({
      owner: comment.author,
      liker,
      targetType: 'comment',
      targetId: comment.id,
      webAppLocation,
      groupingKey: `forum_like:comment:${comment.id}`,
    });
  }

  async deleteReply(id: number, userId: number): Promise<void> {
    const reply = await this.commentRepository.findOne({
      where: { id },
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${id}" not found`);
    }

    if (reply.authorId !== userId) {
      throw new NotFoundException('You can only delete your own replies');
    }

    // Clear notifications that point to this deleted reply
    // For forum comments, the parentObjectId is the post ID when parentObjectType is 'post'
    if (reply.parentObjectType === CommentParentObject.Post) {
      const replyNotificationUrl = commentUrl(reply);
      await this.notifRepository.update(
        {
          webAppLocation: replyNotificationUrl,
          category: NotificationCategory.ForumReply,
        },
        { cleared: true },
      );
    }

    await this.commentRepository.update(id, { deleted: true });
  }

  async findPostsByUser(userId: number): Promise<Post[]> {
    return (
      await this.postRepository.find({
        where: { authorId: userId, deleted: false },
        relations: ['author', 'action'],
      })
    ).filter((post) => this.postIsVisible(post, userId));
  }

  async findCommentsByUser(userId: number): Promise<UserCommentDto[]> {
    const comments = await this.commentRepository.find({
      where: {
        authorId: userId,
        deleted: false,
        parentObjectType: Not(CommentParentObject.Activity),
      },
      relations: ['author'],
    });
    const postIds = comments
      .filter(
        (comment) => comment.parentObjectType === CommentParentObject.Post,
      )
      .map((comment) => comment.parentObjectId);

    const actionIds = comments
      .filter(
        (comment) => comment.parentObjectType === CommentParentObject.Action,
      )
      .map((comment) => comment.parentObjectId);

    const posts = await this.postRepository.find({
      where: { id: In(postIds) },
    });

    const actions = await this.actionRepository.find({
      where: { id: In(actionIds) },
    });

    return comments.map(
      (comment) =>
        new UserCommentDto(
          comment,
          comment.parentObjectType === CommentParentObject.Post
            ? posts.find((post) => post.id === comment.parentObjectId)?.title
            : comment.parentObjectType === CommentParentObject.Action
              ? actions.find((action) => action.id === comment.parentObjectId)
                  ?.name
              : undefined,
        ),
    );
  }

  async findForumCommentsByUser(userId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: {
        authorId: userId,
        deleted: false,
        parentObjectType: CommentParentObject.Post,
      },
      relations: ['author', 'editableContent', 'likes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPostsByTitle(title: string): Promise<Post[]> {
    return this.postRepository.find({
      where: { title: ILike(`%${title}%`), deleted: false },
    });
  }

  async findPostWithComments(id: number, userId?: number): Promise<PostDto> {
    const post = await this.findOnePost(id, userId);
    return this.postWithCommentCount(post);
  }
}
