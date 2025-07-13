import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { CreateReplyDto, ReplyDto, UpdateReplyDto } from './dto/reply.dto';
import { Post } from './entities/post.entity';
import { Reply } from './entities/reply.entity';
import {
  Notification,
  NotificationType,
} from '../notifs/entities/notification.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Reply)
    private replyRepository: Repository<Reply>,
    @InjectRepository(Notification)
    private notifRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId,
    });
    return this.postRepository.save(post);
  }

  async findAllPosts(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['author', 'action'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findPostsByAction(actionId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { actionId },
      relations: ['author', 'action'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOnePost(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'action'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    // Load all replies for this post manually to ensure we get all levels
    const allReplies = await this.replyRepository.find({
      where: { postId: id },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });

    // Organize replies hierarchically and sort
    if (allReplies && allReplies.length > 0) {
      post.replies = this.organizeRepliesHierarchy(allReplies);
    } else {
      post.replies = [];
    }

    return post;
  }

  private organizeRepliesHierarchy(replies: Reply[]): Reply[] {
    // Create a map for quick lookup
    const replyMap = new Map<number, Reply>();
    const topLevelReplies: Reply[] = [];

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
    const sortReplies = (repliesList: Reply[]): Reply[] => {
      return repliesList
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
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

    await this.postRepository.delete(id);
  }

  async createReply(
    createReplyDto: CreateReplyDto,
    userId: number,
  ): Promise<ReplyDto> {
    const post = await this.postRepository.findOne({
      where: { id: createReplyDto.postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID "${createReplyDto.postId}" not found`,
      );
    }

    // Validate parent reply if provided
    let parentReply: Reply | null = null;
    if (createReplyDto.parentId) {
      parentReply = await this.replyRepository.findOne({
        where: { id: createReplyDto.parentId, postId: createReplyDto.postId },
        relations: ['author'],
      });

      if (!parentReply) {
        throw new NotFoundException(
          `Parent reply with ID "${createReplyDto.parentId}" not found`,
        );
      }
    }

    const reply = this.replyRepository.create({
      ...createReplyDto,
      authorId: userId,
    });

    await this.postRepository.update(createReplyDto.postId, {
      updatedAt: new Date(),
    });

    const replyAuthor = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!replyAuthor) {
      throw new NotFoundException(`Reply author with ID "${userId}" not found`);
    }

    // Create notifications
    const notifications: Notification[] = [];

    // Notify post author if different from reply author
    if (post.authorId !== userId) {
      const postNotif = this.notifRepository.create({
        user: post.author,
        message: `${replyAuthor.name} replied to your forum post`,
        category: NotificationType.ForumReply,
        webAppLocation: `/forum/post/${post.id}`,
        mobileAppLocation: `/forum/post/${post.id}`,
      });
      notifications.push(postNotif);
    }

    // Notify parent reply author if this is a nested reply and different from current user
    if (
      parentReply &&
      parentReply.authorId !== userId &&
      parentReply.authorId !== post.authorId
    ) {
      const parentNotif = this.notifRepository.create({
        user: parentReply.author,
        message: `${replyAuthor.name} replied to your comment`,
        category: NotificationType.ForumReply,
        webAppLocation: `/forum/post/${post.id}`,
        mobileAppLocation: `/forum/post/${post.id}`,
      });
      notifications.push(parentNotif);
    }

    if (notifications.length > 0) {
      await this.notifRepository.save(notifications);
      reply.notification = notifications[0]; // Associate with first notification for backward compatibility
    }

    await this.replyRepository.save(reply);

    const loadedReply = await this.replyRepository.findOne({
      where: { id: reply.id },
      relations: ['author', 'post'],
    });
    if (!loadedReply) {
      throw new NotFoundException(`Reply with ID "${reply.id}" not found`);
    }

    return loadedReply;
  }

  async updateReply(
    id: number,
    updateReplyDto: UpdateReplyDto,
    userId: number,
  ): Promise<Reply> {
    const reply = await this.replyRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${id}" not found`);
    }

    if (reply.authorId !== userId) {
      throw new NotFoundException('You can only edit your own replies');
    }

    await this.replyRepository.update(id, updateReplyDto);
    const updatedReply = await this.replyRepository.findOne({
      where: { id },
      relations: ['author', 'post'],
    });

    if (!updatedReply) {
      throw new NotFoundException(
        `Reply with ID "${id}" not found after update`,
      );
    }

    return updatedReply;
  }

  async removeReply(id: number, userId: number): Promise<void> {
    const reply = await this.replyRepository.findOne({
      where: { id },
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${id}" not found`);
    }

    if (reply.authorId !== userId) {
      throw new NotFoundException('You can only delete your own replies');
    }

    await this.replyRepository.delete(id);
  }

  async findPostsByUser(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { authorId: userId },
      relations: ['author', 'action'],
    });
  }
}
