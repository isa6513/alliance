import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, JwtPayload } from '../auth/guards/auth.guard';
import { ReqUser } from '../auth/user.decorator';
import {
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  UserCommentDto,
} from './dto/comment.dto';
import { CreatePostDto, PostDto, UpdatePostDto } from './dto/post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { ForumService } from './forum.service';

@ApiTags('forum')
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('posts')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new forum post' })
  @ApiOkResponse({ type: PostDto })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @ReqUser() user: JwtPayload,
  ): Promise<PostDto> {
    return new PostDto(
      await this.forumService.createPost(createPostDto, user.sub),
    );
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get all forum posts' })
  @ApiOkResponse({ type: [PostDto] })
  findAllPosts(): Promise<PostDto[]> {
    return this.forumService.findAllPosts();
  }

  @Get('posts/action/:actionId')
  @ApiOperation({ summary: 'Get posts for a specific action' })
  @ApiOkResponse({ type: [PostDto] })
  async findPostsByAction(
    @Param('actionId') actionId: string,
  ): Promise<PostDto[]> {
    return this.forumService
      .findPostsByAction(+actionId)
      .then((posts) => posts.map((post) => new PostDto(post)));
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get a specific post with its comments' })
  @ApiOkResponse({ type: PostDto })
  async findOnePost(@Param('id') id: string): Promise<PostDto> {
    return this.forumService.findPostWithComments(+id);
  }

  @Get('posts/:id/last-comment')
  @ApiOperation({ summary: 'Get the last comment for a specific post' })
  @ApiOkResponse({ type: CommentDto })
  async findLastCommentForPost(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentDto | null> {
    const comment = await this.forumService.findLastCommentForPost(id);
    return comment ? new CommentDto(comment) : null;
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get all comments for a specific post' })
  @ApiOkResponse({ type: [CommentDto] })
  async findCommentsForPost(@Param('id') id: string): Promise<CommentDto[]> {
    return this.forumService
      .findCommentsForPost(+id)
      .then((comments) => comments.map((comment) => new CommentDto(comment)));
  }

  @Get('activity/:id/comments')
  @ApiOperation({ summary: 'Get all comments for a specific activity' })
  @ApiOkResponse({ type: [CommentDto] })
  async findCommentsForActivity(
    @Param('id') id: string,
  ): Promise<CommentDto[]> {
    return this.forumService
      .findCommentsForActivity(+id)
      .then((comments) => comments.map((comment) => new CommentDto(comment)));
  }

  @Get('actions/:id/comments')
  @ApiOperation({ summary: 'Get all comments for a specific action' })
  @ApiOkResponse({ type: [CommentDto] })
  async findCommentsForAction(@Param('id') id: string): Promise<CommentDto[]> {
    return this.forumService
      .findCommentsForAction(+id)
      .then((comments) => comments.map((comment) => new CommentDto(comment)));
  }

  @Get('posts/user/:id')
  @ApiOperation({ summary: 'Get all posts by a specific user' })
  @ApiOkResponse({ type: [PostDto] })
  findPostsByUser(@Param('id', ParseIntPipe) id: number): Promise<PostDto[]> {
    return this.forumService
      .findPostsByUser(id)
      .then((posts) => posts.map((post) => new PostDto(post)));
  }

  @Get('posts/user/:id/comments')
  @ApiOperation({
    summary: 'Get all comments by a specific user, excluding activity comments',
  })
  @ApiOkResponse({ type: [UserCommentDto] })
  findCommentsByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserCommentDto[]> {
    return this.forumService.findCommentsByUser(id);
  }

  @Get('posts/user/:id/forumComments')
  @ApiOperation({ summary: 'Get all forum comments by a specific user' })
  @ApiOkResponse({ type: [CommentDto] })
  findForumCommentsByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentDto[]> {
    return this.forumService
      .findForumCommentsByUser(id)
      .then((comments) => comments.map((comment) => new CommentDto(comment)));
  }

  @Patch('posts/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a post' })
  @ApiOkResponse({ type: PostDto })
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @ReqUser() user: JwtPayload,
  ): Promise<PostDto> {
    return new PostDto(
      await this.forumService.updatePost(id, updatePostDto, user.sub),
    );
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiOkResponse()
  removePost(
    @Param('id', ParseIntPipe) id: number,
    @ReqUser() user: JwtPayload,
  ) {
    return this.forumService.removePost(id, user.sub);
  }

  @Post('comments')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new comment on a post' })
  @ApiOkResponse({ type: CommentDto })
  async createComment(
    @Body() createReplyDto: CreateCommentDto,
    @ReqUser() user: JwtPayload,
  ): Promise<CommentDto> {
    return this.forumService.createComment(createReplyDto, user.sub);
  }

  @Patch('comments/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiOkResponse({ type: CommentDto })
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @ReqUser() user: JwtPayload,
  ): Promise<CommentDto> {
    return new CommentDto(
      await this.forumService.updateComment(id, updateCommentDto, user.sub),
    );
  }

  @Post('comments/:id/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Like a comment' })
  @ApiOkResponse({ type: CommentDto })
  async likeComment(
    @Param('id', ParseIntPipe) id: number,
    @ReqUser() user: JwtPayload,
  ): Promise<void> {
    await this.forumService.likePostOrComment(id, user.sub, false, 'comment');
  }

  @Post('comments/:id/unlike')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Unlike a comment' })
  @ApiOkResponse({ type: CommentDto })
  async unlikeComment(
    @Param('id', ParseIntPipe) id: number,
    @ReqUser() user: JwtPayload,
  ): Promise<void> {
    await this.forumService.likePostOrComment(id, user.sub, true, 'comment');
  }

  @Post('posts/:id/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Like a comment' })
  @ApiOkResponse({ type: PostDto })
  async likePost(
    @Param('id', ParseIntPipe) id: number,
    @ReqUser() user: JwtPayload,
  ): Promise<void> {
    new PostDto(
      (await this.forumService.likePostOrComment(
        id,
        user.sub,
        false,
        'post',
      )) as PostEntity,
    );
  }

  @Post('posts/:id/unlike')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiOkResponse({ type: PostDto })
  async unlikePost(
    @Param('id', ParseIntPipe) id: number,
    @ReqUser() user: JwtPayload,
  ): Promise<void> {
    new PostDto(
      (await this.forumService.likePostOrComment(
        id,
        user.sub,
        true,
        'post',
      )) as PostEntity,
    );
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiOkResponse()
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @ReqUser() user: JwtPayload,
  ) {
    return this.forumService.deleteReply(+id, user.sub);
  }
}
