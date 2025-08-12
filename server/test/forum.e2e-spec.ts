import * as request from 'supertest';
import { Action } from '../src/actions/entities/action.entity';
import { CreatePostDto } from '../src/forum/dto/post.dto';
import { createTestApp, TestContext } from './e2e-test-utils';
import { ForumModule } from '../src/forum/forum.module';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ActionStatus } from 'src/actions/entities/action-event.entity';
import { CreateCommentDto } from 'src/forum/dto/comment.dto';
import { CommentParentObject } from 'src/forum/entities/comment.entity';

describe('Forum (e2e)', () => {
  let ctx: TestContext;
  let actionRepo: Repository<Action>;
  let testAction: Action;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    ctx = await createTestApp([ForumModule]);
    actionRepo = ctx.dataSource.getRepository(Action);
    userRepo = ctx.dataSource.getRepository(User);
    // Create test action
    testAction = actionRepo.create({
      name: 'Test Action',
      category: 'Test',
      body: 'Test action for forum tests',
      status: ActionStatus.GatheringCommitments,
    });
    await actionRepo.save(testAction);
  }, 50000);

  describe('Posts', () => {
    it('should create a post', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post',
        })
        .expect(201);

      expect(response.body.title).toBe('Test Post');
      expect(response.body.content).toBe('This is a test post');
      expect(response.body.authorId).toBe(ctx.testUserId);
    });

    it('should create a post with action association', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Test Action Post',
          content: 'This is a test post for an action',
          actionId: testAction.id,
        })
        .expect(201);

      expect(response.body.title).toBe('Test Action Post');
      expect(response.body.actionId).toBe(testAction.id);
    });

    const addTestPost = async () => {
      await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post',
        })
        .expect(201);
    };

    it('should get all posts', async () => {
      await addTestPost();
      await addTestPost();

      const response = await request(ctx.app.getHttpServer())
        .get('/forum/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should get posts by action', async () => {
      await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post',
          actionId: testAction.id,
        })
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
        .get(`/forum/posts/action/${testAction.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0].actionId).toBe(testAction.id);
    });

    it('should get a post by id', async () => {
      await addTestPost();

      const postsResponse = await request(ctx.app.getHttpServer())
        .get('/forum/posts')
        .expect(200);

      expect(postsResponse.body.length).toBeGreaterThanOrEqual(1);

      const postId = postsResponse.body[0].id;

      // Then get specific post
      const response = await request(ctx.app.getHttpServer())
        .get(`/forum/posts/${postId}`)
        .expect(200);

      expect(response.body.id).toBe(postId);
      expect(response.body.title).toBeDefined();
      expect(response.body.content).toBeDefined();
      expect(response.body.commentCount).toBeDefined();
    });

    it('should update a post', async () => {
      // Create a post to update
      const createResponse = await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Post to Update',
          content: 'This post will be updated',
        })
        .expect(201);

      const postId = createResponse.body.id;

      // Update the post
      const response = await request(ctx.app.getHttpServer())
        .patch(`/forum/posts/${postId}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Updated Post',
          content: 'This post has been updated',
        })
        .expect(200);

      expect(response.body.id).toBe(postId);
      expect(response.body.title).toBe('Updated Post');
      expect(response.body.content).toBe('This post has been updated');
    });

    it('should delete a post', async () => {
      // Create a post to delete
      const createResponse = await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Post to Delete',
          content: 'This post will be deleted',
        })
        .expect(201);

      const postId = createResponse.body.id;

      // Delete the post
      await request(ctx.app.getHttpServer())
        .delete(`/forum/posts/${postId}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .expect(200);

      // Verify the post is deleted
      await request(ctx.app.getHttpServer())
        .get(`/forum/posts/${postId}`)
        .expect(404);
    });
  });

  describe('Replies', () => {
    let testPostId: number;

    beforeEach(async () => {
      const testPost: CreatePostDto = {
        title: 'Test Post for Replies',
        content: 'This post will have replies',
        actionId: testAction.id,
      };

      // Create a post for reply tests
      const createResponse = await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send(testPost)
        .expect(201);

      testPostId = createResponse.body.id;
    });

    it('should create a reply', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'This is a test reply',
          parentObjectId: testPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      expect(response.body.content).toBe('This is a test reply');
      expect(response.body.parentObjectId).toBe(testPostId);
      expect(response.body.authorId).toBe(ctx.testUserId);
    });

    it('should update a reply', async () => {
      // Create a reply to update
      const createResponse = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Reply to update',
          parentObjectId: testPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const replyId = createResponse.body.id;

      // Update the reply
      const response = await request(ctx.app.getHttpServer())
        .patch(`/forum/comments/${replyId}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Updated reply',
        })
        .expect(200);

      expect(response.body.id).toBe(replyId);
      expect(response.body.content).toBe('Updated reply');
    });

    it('should delete a reply', async () => {
      // Create a reply to delete
      const createResponse = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Reply to delete',
          parentObjectId: testPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const replyId = createResponse.body.id;

      // Delete the reply
      await request(ctx.app.getHttpServer())
        .delete(`/forum/comments/${replyId}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .expect(200);

      // Verify reply is deleted by trying to update it (should fail)
      const reply = await request(ctx.app.getHttpServer())
        .patch(`/forum/comments/${replyId}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'This should fail',
        });

      expect(reply.body.deleted).toBe(true);
    });

    it("should not allow updating another user's reply", async () => {
      // Create a second user
      const anotherUser = userRepo.create({
        email: 'anotheruser@test.com',
        password: 'password',
        name: 'Another Test User',
      });
      await userRepo.save(anotherUser);

      // Create token for another user
      const anotherToken = ctx.jwtService.sign(
        {
          sub: anotherUser.id,
          email: anotherUser.email,
          name: anotherUser.name,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      );

      // Create a reply as the first user
      const createResponse = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Original user reply',
          parentObjectId: testPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const replyId = createResponse.body.id;

      // Try to update the reply as another user
      await request(ctx.app.getHttpServer())
        .patch(`/forum/comments/${replyId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          content: 'This should fail',
        })
        .expect(404);
    });

    it('should create a nested reply', async () => {
      // Create a parent reply
      const parentResponse = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'This is a parent reply',
          parentObjectId: testPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const parentReplyId = parentResponse.body.id;

      // Create a nested reply
      const childResponse = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'This is a nested reply',
          parentObjectId: testPostId,
          parentId: parentReplyId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      expect(childResponse.body.content).toBe('This is a nested reply');
      expect(childResponse.body.parentObjectId).toBe(testPostId);
      expect(childResponse.body.parentId).toBe(parentReplyId);
      expect(childResponse.body.authorId).toBe(ctx.testUserId);
    });

    it('should organize replies hierarchically when fetching post', async () => {
      // Create parent reply
      const parentResponse = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Parent reply',
          parentObjectId: testPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const parentReplyId = parentResponse.body.id;

      // Create child replies
      const child1Response = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'First child reply',
          parentObjectId: testPostId,
          parentId: parentReplyId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const child2Response = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Second child reply',
          parentObjectId: testPostId,
          parentId: parentReplyId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      // Create another top-level reply
      await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Another top-level reply',
          parentObjectId: testPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const postResponse = await request(ctx.app.getHttpServer())
        .get(`/forum/posts/${testPostId}`)
        .expect(200);

      expect(postResponse.body.commentCount).toBeDefined();
      expect(postResponse.body.commentCount).toBeGreaterThan(0);

      const commentsResponse = await request(ctx.app.getHttpServer())
        .get(`/forum/posts/${testPostId}/comments`)
        .expect(200);

      const topLevelReplies = commentsResponse.body;

      // Find the parent reply
      const parentReply = topLevelReplies.find(
        (reply) => reply.id === parentReplyId,
      );
      expect(parentReply).toBeDefined();
      expect(parentReply.content).toBe('Parent reply');
      expect(parentReply.children).toBeDefined();
      expect(Array.isArray(parentReply.children)).toBe(true);
      expect(parentReply.children.length).toBe(2);

      // Check child replies are properly nested
      const childIds = parentReply.children.map((child) => child.id);
      expect(childIds).toContain(child1Response.body.id);
      expect(childIds).toContain(child2Response.body.id);

      // Check that children have correct parentId
      parentReply.children.forEach((child) => {
        expect(child.parentId).toBe(parentReplyId);
      });
    });

    it('should fail to create nested reply with invalid parentId', async () => {
      await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'This should fail',
          parentObjectId: testPostId,
          parentId: 99999, // Non-existent parent
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(404);
    });

    it('should fail to create nested reply with parentId from different post', async () => {
      // Create another post
      const anotherPostResponse = await request(ctx.app.getHttpServer())
        .post('/forum/posts')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          title: 'Another Test Post',
          content: 'This is another test post',
        })
        .expect(201);

      const anotherPostId = anotherPostResponse.body.id;

      // Create a reply on the other post
      const otherPostReplyResponse = await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'Reply on other post',
          parentObjectId: anotherPostId,
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(201);

      const otherPostReplyId = otherPostReplyResponse.body.id;

      // Try to create a nested reply using parentId from different post
      await request(ctx.app.getHttpServer())
        .post('/forum/comments')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({
          content: 'This should fail',
          parentObjectId: testPostId,
          parentId: otherPostReplyId, // Parent from different post
          parentObjectType: CommentParentObject.Post,
        } satisfies CreateCommentDto)
        .expect(404);
    });
  });
});
