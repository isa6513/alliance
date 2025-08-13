import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
  ParseIntPipe,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ActionsService } from './actions.service';
import {
  ActionDto,
  CreateActionDto,
  UpdateActionDto,
  UserActionDto,
  LatLonDto,
  CreateActionEventDto,
  ActionActivityDto,
  UpdateActionActivityDto,
} from './dto/action.dto';
import { AuthGuard, JwtRequest } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { Sse, MessageEvent } from '@nestjs/common';
import { Observable, fromEvent, from, merge } from 'rxjs';
import { map, filter, scan, share, bufferTime } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthOptionalGuard } from 'src/auth/guards/authoptional.guard';
import { UserService } from 'src/user/user.service';
import { ActionStatus } from './entities/action-event.entity';
import { CommentDto, CreateCommentDto } from 'src/forum/dto/comment.dto';

@Controller('actions')
export class ActionsController {
  private readonly delta$: Observable<{ actionId: number; delta: number }>;
  constructor(
    private readonly actionsService: ActionsService,
    private readonly eventEmitter: EventEmitter2,
    private userService: UserService,
  ) {
    this.delta$ = fromEvent<{ actionId: number; delta: number }>(
      this.eventEmitter,
      'action.delta',
    ).pipe(share());
  }

  @Post('join/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserActionDto })
  join(@Request() req: JwtRequest, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.actionsService.joinAction(+id, req.user.sub);
  }

  @Post('complete/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserActionDto })
  complete(@Request() req: JwtRequest, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.actionsService.completeAction(+id, req.user.sub);
  }

  @Get('myStatus/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserActionDto })
  @ApiOperation({
    summary: "Get the authenticated user's relation to a single action",
  })
  async myStatus(
    @Request() req: JwtRequest,
    @Param('id') id: string,
  ): Promise<UserActionDto | null> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const userAction = await this.actionsService.getActionRelation(
      +id,
      req.user.sub,
    );
    return userAction ? new UserActionDto(userAction) : null;
  }

  //doesn't include drafts
  @Get()
  @Public()
  @ApiOkResponse({ type: [ActionDto] })
  async findAll(): Promise<ActionDto[]> {
    return this.actionsService.findPublic();
  }

  @Get('myActionRelations')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: [UserActionDto] })
  async myActionRelations(@Request() req: JwtRequest) {
    return this.actionsService.findActionRelations(req.user?.sub);
  }

  @Get('actionRelations/:id')
  @Public()
  @ApiOkResponse({ type: [UserActionDto] })
  async actionRelations(@Param('id', ParseIntPipe) id: number) {
    return this.actionsService.findActionRelations(id);
  }

  @Get('userlocations/:id')
  @ApiOkResponse({ type: [LatLonDto] })
  async userLocations(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LatLonDto[]> {
    return this.actionsService.userCoordinatesForAction(id);
  }

  @Get('activities/feed')
  @Public()
  @ApiOkResponse({ type: [ActionActivityDto] })
  @ApiOperation({
    summary: 'Get recent activities from all actions for the feed',
  })
  async getActivityFeed(
    @Query('limit') limit?: string,
  ): Promise<ActionActivityDto[]> {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.actionsService.getActivityFeed(limitNum);
  }

  @Get('activities/:id')
  @Public()
  @ApiOkResponse({ type: ActionActivityDto })
  async getActivity(@Param('id', ParseIntPipe) id: number) {
    return this.actionsService.getActivity(id);
  }

  @Get(':id/activities')
  @Public()
  @ApiOkResponse({ type: [ActionActivityDto] })
  @ApiOperation({ summary: 'Get recent activities for an action' })
  async getActionActivities(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActionActivityDto[]> {
    return this.actionsService.getActionActivities(id);
  }

  @Get('all')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: [ActionDto] })
  async findAllWithDrafts() {
    return this.actionsService.findAll();
  }

  @Sse('live/:id')
  @Public()
  @ApiOperation({ summary: 'SSE endpoint for join counts on a single action' })
  sseActionCount(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    const snapshot$ = from(this.actionsService.countCommitted(id));

    const counter$ = merge(
      snapshot$,
      this.delta$.pipe(
        filter((e) => e.actionId === id),
        map((e) => e.delta),
      ),
    ).pipe(
      scan((total, delta) => total + delta),
      map((t) => ({ data: t.toString() }) as MessageEvent),
    );

    return counter$;
  }

  @Sse('live-list')
  @Public()
  @ApiOperation({ summary: 'SSE endpoint for join counts on multiple actions' })
  liveList(@Query('ids') idsQuery?: string): Observable<MessageEvent> {
    if (!idsQuery) throw new BadRequestException('ids query param required');
    const ids = idsQuery.split(',').map(Number).filter(Boolean);
    const idSet = new Set(ids);

    /* 1️⃣ initial snapshot */
    const snapshot$ = from(this.actionsService.countCommittedBulk(ids));

    /* 2️⃣ batch all deltas for these ids every 100 ms */
    const batched$ = this.delta$.pipe(
      filter((e) => idSet.has(e.actionId)), // only the ids this client cares about
      bufferTime(100), // 100 ms window (tweak as needed)
      filter((buf) => buf.length > 0), // skip empty windows
      map((buf) => {
        // collapse many deltas into cumulative {id: Δ}
        const byId: Record<number, number> = {};
        for (const { actionId, delta } of buf) {
          byId[actionId] = (byId[actionId] ?? 0) + delta;
        }
        return byId;
      }),
    );

    /* 3️⃣ running totals */
    const counters$ = merge(snapshot$, batched$).pipe(
      scan(
        (state, change) => {
          // change is snapshot (full map) *or* batched delta map
          for (const id of Object.keys(change).map(Number)) {
            state[id] = (state[id] ?? 0) + change[id];
          }
          return { ...state }; // emit copy for distinct reference
        },
        {} as Record<number, number>,
      ),
      map((s) => ({ data: JSON.stringify(s) }) as MessageEvent),
    );

    return counters$;
  }

  @Get('opengraph')
  @Public()
  @ApiOkResponse({ type: String })
  async opengraph(@Query() query) {
    const { url } = query;
    const id = url.substring(url.lastIndexOf('/') + 1);
    const action = await this.actionsService.findOne(+id);
    if (!action) {
      throw new NotFoundException('Action not found');
    }

    // Don't allow opengraph for draft actions
    if (action.status === ActionStatus.Draft) {
      throw new NotFoundException('Action not found');
    }
    const html = `
    <html prefix="og: https://ogp.me/ns#">
        <head>
        <title>Join the Alliance to participate in ${action.name}</title>
            <meta property="og:title" content="${action.name}" />
            <meta property="og:description" content="${action.shortDescription}" />
            <meta property="og:type" content="website" />
        </head>
    </html>
    `;
    return html;
  }

  @Get('friendActivity')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: [ActionActivityDto] })
  async friendActivity(@Request() req: JwtRequest) {
    return this.actionsService.friendActivity(req.user.sub);
  }

  @Get(':id')
  @UseGuards(AuthOptionalGuard)
  @ApiOkResponse({ type: ActionDto })
  @ApiUnauthorizedResponse()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: JwtRequest,
  ): Promise<ActionDto | null> {
    const action = await this.actionsService.findOne(id);

    if (!action) {
      throw new NotFoundException('Action not found');
    }

    if (action.status === ActionStatus.Draft) {
      if (!req.user || !(await this.userService.isAdmin(req.user.sub))) {
        throw new NotFoundException('Action not found');
      }
    }

    return action;
  }

  @Post('create')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ActionDto })
  create(@Body() createActionDto: CreateActionDto) {
    return this.actionsService.create(createActionDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ActionDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActionDto: UpdateActionDto,
  ) {
    return this.actionsService.update(id, updateActionDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOkResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actionsService.remove(id);
  }

  @Get('completed/:id')
  @ApiOkResponse({ type: [ActionDto] })
  async findCompletedForUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActionDto[]> {
    return this.actionsService.findCompletedForUser(+id);
  }

  @Post(':id/events')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ActionDto })
  async addEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() actionEventDto: CreateActionEventDto,
  ): Promise<ActionDto> {
    return this.actionsService.addEvent(id, actionEventDto);
  }

  @Post('clearDb')
  @UseGuards(AdminGuard)
  @ApiOkResponse()
  clearDb() {
    return this.actionsService.clearDb();
  }

  @Post('setTestRelations')
  @UseGuards(AdminGuard)
  @ApiOkResponse()
  setTestRelations(@Request() req: JwtRequest) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.actionsService.setTestRelations(req.user.sub);
  }

  @Post('likeActivity/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ActionActivityDto })
  likeActivity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: JwtRequest,
  ): Promise<ActionActivityDto> {
    return this.actionsService.likeActivity(id, req.user.sub);
  }

  @Post('unlikeActivity/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ActionActivityDto })
  unlikeActivity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: JwtRequest,
  ): Promise<ActionActivityDto> {
    return this.actionsService.likeActivity(id, req.user.sub, true);
  }

  @Post('addActivityComment/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: CommentDto })
  addActivityComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() commentDto: CreateCommentDto,
    @Request() req: JwtRequest,
  ): Promise<CommentDto> {
    return this.actionsService.addActivityComment(id, commentDto, req.user.sub);
  }

  @Post('updateActivity/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ActionActivityDto })
  updateActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() commentDto: UpdateActionActivityDto,
    @Request() req: JwtRequest,
  ): Promise<ActionActivityDto> {
    return this.actionsService.updateActivity(id, commentDto, req.user.sub);
  }
}
