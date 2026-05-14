import { run } from '@alliance/common/run';
import { appendQueryParam } from '@alliance/common/url';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from 'src/actions/entities/action.entity';
import { generateCIDForShareUrl } from 'src/notifs/notif-utils';
import { actionUrl, withSid } from 'src/search/approutes';
import { User } from 'src/user/entities/user.entity';
import {
  EntityManager,
  type FindOptionsWhere,
  IsNull,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { ExternalShareTarget } from './entities/external-share-target.entity';
import { ShareUrl } from './entities/share-url.entity';

enum ShareUrlKind {
  Action = 'action',
  ExternalTarget = 'externalTarget',
}

const NOT_FOUND_MESSAGE: Record<ShareUrlKind, string> = {
  [ShareUrlKind.Action]: 'specified action not found',
  [ShareUrlKind.ExternalTarget]: 'specified share target not found',
} as const;

type GetOrCreateInput =
  | { kind: ShareUrlKind.Action; actionId: number; userId: number }
  | {
      kind: ShareUrlKind.ExternalTarget;
      externalTarget: ExternalShareTarget;
      userId: number;
    };

type BuildRowInput = GetOrCreateInput & {
  duplicate: boolean;
  label?: string | null;
};

function assertExactlyOneTarget(
  actionId: number | undefined,
  externalTargetId: number | undefined,
): void {
  if (
    (actionId === undefined && externalTargetId === undefined) ||
    (actionId !== undefined && externalTargetId !== undefined)
  ) {
    throw new BadRequestException(
      'Exactly one of actionId or externalTargetId must be provided',
    );
  }
}

@Injectable()
export class ShareUrlsService {
  constructor(
    @InjectRepository(ShareUrl)
    private readonly shareUrlRepository: Repository<ShareUrl>,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
  ) {}

  async getShareLink(params: {
    userId: number;
    actionId?: number;
    externalTargetId?: number;
  }): Promise<string> {
    const { userId, actionId, externalTargetId } = params;
    assertExactlyOneTarget(actionId, externalTargetId);
    const shareUrl =
      externalTargetId !== undefined
        ? await this.getOrCreateForExternalTargetId(externalTargetId, userId)
        : await this.getOrCreateForAction(actionId!, userId);
    return shareUrl.url;
  }

  async createDuplicate(params: {
    userId: number;
    actionId?: number;
    externalTargetId?: number;
    label?: string;
  }): Promise<ShareUrl> {
    const { userId, actionId, externalTargetId, label } = params;
    assertExactlyOneTarget(actionId, externalTargetId);
    const trimmedLabel = label?.trim();
    const labelValue = trimmedLabel ? trimmedLabel : null;
    if (externalTargetId !== undefined) {
      return this.createDuplicateForExternalTargetId(
        externalTargetId,
        userId,
        labelValue,
      );
    }
    return this.createDuplicateForAction(actionId!, userId, labelValue);
  }

  private async createDuplicateForExternalTargetId(
    externalTargetId: number,
    userId: number,
    label: string | null,
  ): Promise<ShareUrl> {
    return this.shareUrlRepository.manager.transaction(async (m) => {
      const target = await m.findOne(ExternalShareTarget, {
        where: { id: externalTargetId },
        lock: { mode: 'pessimistic_read' },
      });
      if (!target) {
        throw new NotFoundException('specified share target not found');
      }
      return this.buildAndSaveRow(m, {
        kind: ShareUrlKind.ExternalTarget,
        externalTarget: target,
        userId,
        duplicate: true,
        label,
      });
    });
  }

  private async createDuplicateForAction(
    actionId: number,
    userId: number,
    label: string | null,
  ): Promise<ShareUrl> {
    return this.buildAndSaveRow(this.shareUrlRepository.manager, {
      kind: ShareUrlKind.Action,
      actionId,
      userId,
      duplicate: true,
      label,
    });
  }

  async findForUser(userId: number): Promise<ShareUrl[]> {
    return this.shareUrlRepository.find({
      where: { user: { id: userId } },
      relations: { action: true, externalTarget: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLabel(
    id: string,
    rawLabel: string | undefined,
  ): Promise<ShareUrl> {
    const trimmed = rawLabel?.trim();
    const nextLabel = trimmed ? trimmed : null;
    const row = await this.shareUrlRepository.findOne({
      where: { id },
      relations: { action: true, externalTarget: true },
    });
    if (!row) {
      throw new NotFoundException('share url not found');
    }
    row.label = nextLabel;
    return this.shareUrlRepository.save(row);
  }

  private async getOrCreateForExternalTargetId(
    externalTargetId: number,
    userId: number,
  ): Promise<ShareUrl> {
    return this.shareUrlRepository.manager.transaction(async (m) => {
      const target = await m.findOne(ExternalShareTarget, {
        where: { id: externalTargetId },
        lock: { mode: 'pessimistic_read' },
      });
      if (!target) {
        throw new NotFoundException('specified share target not found');
      }
      return this.getOrCreate(m, {
        kind: ShareUrlKind.ExternalTarget,
        externalTarget: target,
        userId,
      });
    });
  }

  async getOrCreateForAction(
    actionId: number,
    userId: number,
  ): Promise<ShareUrl> {
    return this.getOrCreate(this.shareUrlRepository.manager, {
      kind: ShareUrlKind.Action,
      actionId,
      userId,
    });
  }

  async findActionShareByActionAndSid(
    actionId: number,
    sid: string,
  ): Promise<ShareUrl | null> {
    return this.shareUrlRepository.findOne({
      where: { action: { id: actionId }, sid },
      relations: { user: true },
    });
  }

  async findByReferralSid(sid: string): Promise<ShareUrl | null> {
    return this.shareUrlRepository.findOne({
      where: { sid },
      relations: { user: true, action: true, externalTarget: true },
    });
  }

  async findUserBySid(sid: string): Promise<User | null> {
    const trimmed = sid.trim();
    if (!trimmed) return null;
    const shareUrl = await this.shareUrlRepository.findOne({
      where: { sid: trimmed },
      relations: { user: true },
    });
    return shareUrl?.user ?? null;
  }

  async findActionShareSidsForUser(userId: number): Promise<string[]> {
    const shareUrls = await this.shareUrlRepository.find({
      where: { user: { id: userId }, actionId: Not(IsNull()) },
    });
    return shareUrls
      .map((su) => su.sid ?? (su.data?.['sid'] as string | undefined))
      .filter((s): s is string => !!s);
  }

  async findForAction(actionId: number): Promise<ShareUrl[]> {
    return this.shareUrlRepository.find({
      where: { action: { id: actionId } },
      relations: { user: true },
    });
  }

  async recomputeUrlsForExternalTarget(
    target: ExternalShareTarget,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager?.getRepository(ShareUrl) ?? this.shareUrlRepository;
    const rows = await repo.find({
      where: { externalTarget: { id: target.id } },
    });
    for (const row of rows) {
      if (!row.sid) continue;
      row.url = appendQueryParam(target.url, target.paramName, row.sid);
    }
    if (rows.length > 0) {
      await repo.save(rows);
    }
  }

  private async getOrCreate(
    manager: EntityManager,
    input: GetOrCreateInput,
  ): Promise<ShareUrl> {
    const repo = manager.getRepository(ShareUrl);
    const where = run((): FindOptionsWhere<ShareUrl> => {
      switch (input.kind) {
        case ShareUrlKind.Action:
          return {
            user: { id: input.userId },
            action: { id: input.actionId },
            duplicate: false,
          };
        case ShareUrlKind.ExternalTarget:
          return {
            user: { id: input.userId },
            externalTarget: { id: input.externalTarget.id },
            duplicate: false,
          };
        default:
          throw new Error(
            `getOrCreate: unknown share url kind: ${input satisfies never}`,
          );
      }
    });
    const existing = await repo.findOne({ where });
    if (existing) {
      return existing;
    }

    try {
      return await this.buildAndSaveRow(manager, {
        ...input,
        duplicate: false,
      });
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const code = (err as { code?: string }).code;
        if (code === '23505') {
          const winner = await repo.findOne({ where });
          if (winner) {
            return winner;
          }
        }
      }
      throw err;
    }
  }

  private async buildAndSaveRow(
    manager: EntityManager,
    input: BuildRowInput,
  ): Promise<ShareUrl> {
    const repo = manager.getRepository(ShareUrl);
    const sid = generateCIDForShareUrl();
    const built = await run(
      async (): Promise<{
        url: string;
        action: Action | null;
        externalTarget: ExternalShareTarget | null;
      }> => {
        switch (input.kind) {
          case ShareUrlKind.Action: {
            const action = await this.actionRepository.findOne({
              where: { id: input.actionId },
            });
            if (!action) {
              throw new NotFoundException(NOT_FOUND_MESSAGE[input.kind]);
            }
            return {
              url: withSid(actionUrl(input.actionId, true), sid),
              action,
              externalTarget: null,
            };
          }
          case ShareUrlKind.ExternalTarget:
            return {
              url: appendQueryParam(
                input.externalTarget.url,
                input.externalTarget.paramName,
                sid,
              ),
              action: null,
              externalTarget: input.externalTarget,
            };
          default:
            throw new Error(
              `buildAndSaveRow: unknown share url kind: ${input satisfies never}`,
            );
        }
      },
    );

    const shareUrl = repo.create({
      url: built.url,
      user: { id: input.userId },
      action: built.action,
      externalTarget: built.externalTarget,
      sid,
      data: { sid },
      duplicate: input.duplicate,
      label: input.label ?? null,
    });

    try {
      return await repo.save(shareUrl);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as { code?: string }).code === '23503'
      ) {
        throw new NotFoundException(NOT_FOUND_MESSAGE[input.kind]);
      }
      throw err;
    }
  }
}
