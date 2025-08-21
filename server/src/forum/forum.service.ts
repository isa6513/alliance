import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreatePostDto, PostDto, UpdatePostDto } from './dto/post.dto';
import {
  CreateCommentDto,
  CommentDto,
  UpdateCommentDto,
} from './dto/comment.dto';
import { Post } from './entities/post.entity';
import { Comment, CommentParentObject } from './entities/comment.entity';
import {
  Notification,
  NotificationType,
} from '../notifs/entities/notification.entity';
import { User } from '../user/user.entity';
import { activityReplyUrl, replyUrl } from 'src/search/approutes';
import { ProfileDto } from 'src/user/user.dto';
import { ActionActivity } from 'src/actions/entities/action-activity.entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Notification)
    private notifRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ActionActivity)
    private actionActivityRepository: Repository<ActionActivity>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<Post> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const post = this.postRepository.create({
      ...createPostDto,
      author: user,
      authorId: user.id,
    });
    return this.postRepository.save(post);
  }

  async findAllPosts(): Promise<PostDto[]> {
    const posts = await this.postRepository
      .find({
        where: { deleted: false },
        relations: ['author', 'action'],
        order: { updatedAt: 'DESC' },
      })
      .then((posts) => {
        return Promise.all(
          posts.map(async (post) => {
            const commentCount = await this.countCommentsForPost(post.id);
            return new PostDto(post, commentCount);
          }),
        );
      });
    return posts;
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
    const posts = await this.postRepository.find({
      where: { actionId, deleted: false },
      relations: ['author', 'action'],
      order: { updatedAt: 'DESC' },
    });
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

  async findOnePost(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'action'],
    });

    if (!post || post.deleted) {
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
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });

    return this.organizeRepliesHierarchy(allComments);
  }

  async findCommentsForActivity(activityId: number): Promise<Comment[]> {
    const allComments = await this.commentRepository.find({
      where: {
        parentObjectId: activityId,
        parentObjectType: CommentParentObject.Activity,
      },
      relations: ['author'],
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
      relations: ['author'],
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
    const post = await this.findOnePost(id);

    if (post.authorId !== userId) {
      throw new NotFoundException('You can only edit your own posts');
    }

    await this.postRepository.update(id, updatePostDto);
    return this.findOnePost(id);
  }

  async removePost(id: number, userId: number): Promise<void> {
    const post = await this.findOnePost(id);

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

    const reply = this.commentRepository.create({
      ...createCommentDto,
      authorId: userId,
    });

    await this.postRepository.update(createCommentDto.parentObjectId, {
      updatedAt: new Date(),
    });

    const replyAuthor = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!replyAuthor) {
      throw new NotFoundException(`Reply author with ID "${userId}" not found`);
    }

    // Save the reply first to get the ID
    await this.commentRepository.save(reply);

    const replyWithAuthor = await this.commentRepository.findOne({
      where: { id: reply.id },
      relations: ['author'],
    });

    this.sendNotifsForNewComment(replyWithAuthor!);

    const loadedReply = await this.commentRepository.findOne({
      where: { id: reply.id },
      relations: ['author'],
    });
    if (!loadedReply) {
      throw new NotFoundException(`Reply with ID "${reply.id}" not found`);
    }

    return new CommentDto(loadedReply);
  }

  async sendNotifsForNewComment(comment: Comment): Promise<void> {
    // Create notifications
    const notifications: Notification[] = [];

    if (comment.parentObjectType === CommentParentObject.Post) {
      const post = await this.postRepository.findOne({
        where: { id: comment.parentObjectId },
        relations: ['author'],
      });

      if (!post || post.deleted) {
        throw new NotFoundException(
          `Post with ID "${comment.parentObjectId}" not found`,
        );
      }

      const authorProfile = new ProfileDto(comment.author);
      // Notify post author if different from comment author
      if (post.authorId !== comment.authorId) {
        const postNotif = this.notifRepository.create({
          user: post.author,
          message: `${authorProfile.displayName} replied to your forum post`,
          category: NotificationType.ForumReply,
          webAppLocation: replyUrl(post.id, comment.id),
          mobileAppLocation: replyUrl(post.id, comment.id),
        });
        notifications.push(postNotif);
      }

      let parentReply: Comment | null = null;
      if (comment.parentId) {
        parentReply = await this.commentRepository.findOne({
          where: { id: comment.parentId },
          relations: ['author'],
        });
      }

      // Notify parent reply author if this is a nested reply and different from comment author
      if (
        parentReply &&
        parentReply.authorId !== comment.authorId &&
        parentReply.authorId !== post.authorId
      ) {
        const parentNotif = this.notifRepository.create({
          user: parentReply.author,
          message: `${authorProfile.displayName} replied to your comment`,
          category: NotificationType.ForumReply,
          webAppLocation: replyUrl(post.id, comment.id),
          mobileAppLocation: replyUrl(post.id, comment.id),
        });
        notifications.push(parentNotif);
      }

      if (notifications.length > 0) {
        await this.notifRepository.save(notifications);
        comment.notification = notifications[0]; // Associate with first notification for backward compatibility
      }
    } else if (comment.parentObjectType === CommentParentObject.Activity) {
      const activity = await this.actionActivityRepository.findOne({
        where: { id: comment.parentObjectId },
        relations: ['user'],
      });
      if (!activity) {
        throw new NotFoundException(
          `Activity with ID "${comment.parentObjectId}" not found`,
        );
      }

      const authorProfile = new ProfileDto(comment.author);
      if (activity.userId !== comment.authorId) {
        const appUrl = activityReplyUrl(
          activity.actionId,
          activity.id,
          comment.id,
        );
        const activityNotif = this.notifRepository.create({
          user: activity.user,
          message: `${authorProfile.displayName} replied to your action activity`,
          category: NotificationType.ForumReply,
          webAppLocation: appUrl,
          mobileAppLocation: appUrl,
        });
        notifications.push(activityNotif);
      }

      // Handle parent comment notifications for activities
      let parentReply: Comment | null = null;
      if (comment.parentId) {
        parentReply = await this.commentRepository.findOne({
          where: { id: comment.parentId },
          relations: ['author'],
        });
      }

      // Notify parent reply author if this is a nested reply and different from comment author and activity owner
      if (
        parentReply &&
        parentReply.authorId !== comment.authorId &&
        parentReply.authorId !== activity.userId
      ) {
        const appUrl = activityReplyUrl(
          activity.actionId,
          activity.id,
          comment.id,
        );
        const parentNotif = this.notifRepository.create({
          user: parentReply.author,
          message: `${authorProfile.displayName} replied to your comment`,
          category: NotificationType.ForumReply,
          webAppLocation: appUrl,
          mobileAppLocation: appUrl,
        });
        notifications.push(parentNotif);
      }

      if (notifications.length > 0) {
        await this.notifRepository.save(notifications);
      }
    }
  }

  async updateComment(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<Comment> {
    const reply = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${id}" not found`);
    }

    if (reply.authorId !== userId) {
      throw new NotFoundException('You can only edit your own replies');
    }

    await this.commentRepository.update(id, updateCommentDto);
    const updatedReply = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!updatedReply) {
      throw new NotFoundException(
        `Reply with ID "${id}" not found after update`,
      );
    }

    return updatedReply;
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
      const replyNotificationUrl = replyUrl(reply.parentObjectId, reply.id);
      await this.notifRepository.update(
        {
          webAppLocation: replyNotificationUrl,
          category: NotificationType.ForumReply,
        },
        { cleared: true },
      );
    }

    await this.commentRepository.update(id, { deleted: true });
  }

  async findPostsByUser(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { authorId: userId },
      relations: ['author', 'action'],
    });
  }

  async findPostsByTitle(title: string): Promise<Post[]> {
    return this.postRepository.find({
      where: { title: ILike(`%${title}%`), deleted: false },
    });
  }

  async findPostWithComments(id: number): Promise<PostDto> {
    const post = await this.findOnePost(id);
    const commentCount = await this.countCommentsForPost(id);
    return new PostDto(post, commentCount);
  }
}
