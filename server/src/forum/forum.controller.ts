import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/reply.dto';
import { AuthGuard, JwtPayload } from '../auth/guards/auth.guard';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ReqUser } from '../auth/user.decorator';
import { PostDto } from './dto/post.dto';
import { CommentDto } from './dto/reply.dto';

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
    return this.forumService
      .findAllPosts()
      .then((posts) => posts.map((post) => new PostDto(post)));
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

  @Get('posts/user/:id')
  @ApiOperation({ summary: 'Get all posts by a specific user' })
  @ApiOkResponse({ type: [PostDto] })
  findPostsByUser(@Param('id', ParseIntPipe) id: number): Promise<PostDto[]> {
    return this.forumService
      .findPostsByUser(id)
      .then((posts) => posts.map((post) => new PostDto(post)));
  }

  @Patch('posts/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a post' })
  @ApiOkResponse({ type: PostDto })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @ReqUser() user: JwtPayload,
  ): Promise<PostDto> {
    return new PostDto(
      await this.forumService.updatePost(+id, updatePostDto, user.sub),
    );
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiOkResponse()
  removePost(@Param('id') id: string, @ReqUser() user: JwtPayload) {
    return this.forumService.removePost(+id, user.sub);
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
  updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @ReqUser() user: JwtPayload,
  ): Promise<CommentDto> {
    return this.forumService.updateComment(+id, updateCommentDto, user.sub);
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiOkResponse()
  deleteComment(@Param('id') id: string, @ReqUser() user: JwtPayload) {
    return this.forumService.deleteReply(+id, user.sub);
  }
}
