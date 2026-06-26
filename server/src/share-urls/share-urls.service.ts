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
import { actionUrl, signupUrl, withRef, withSid } from 'src/search/approutes';
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
import { ShareUrl, ShareUrlKind } from './entities/share-url.entity';

const NOT_FOUND_MESSAGE: Record<ShareUrlKind, string> = {
  [ShareUrlKind.Action]: 'specified action not found',
  [ShareUrlKind.ExternalTarget]: 'specified share target not found',
  [ShareUrlKind.Invite]: 'invite share link could not be created',
} as const;

export type ShareUrlOwner =
  | { type: 'user'; userId: number }
  | { type: 'campaign'; campaignId: number };

function ownerWhere(owner: ShareUrlOwner): FindOptionsWhere<ShareUrl> {
  switch (owner.type) {
    case 'user':
      return { user: { id: owner.userId } };
    case 'campaign':
      return { campaign: { id: owner.campaignId } };
    default:
      throw new Error(`unknown share url owner: ${owner satisfies never}`);
  }
}

function ownerColumns(owner: ShareUrlOwner): {
  userId: number | null;
  campaignId: number | null;
} {
  switch (owner.type) {
    case 'user':
      return { userId: owner.userId, campaignId: null };
    case 'campaign':
      return { userId: null, campaignId: owner.campaignId };
    default:
      throw new Error(`unknown share url owner: ${owner satisfies never}`);
  }
}

type GetOrCreateInput =
  | { kind: ShareUrlKind.Action; actionId: number; owner: ShareUrlOwner }
  | {
      kind: ShareUrlKind.ExternalTarget;
      externalTarget: ExternalShareTarget;
      owner: ShareUrlOwner;
    }
  | { kind: ShareUrlKind.Invite; owner: ShareUrlOwner };

type BuildRowInput = GetOrCreateInput & {
  duplicate: boolean;
  label?: string | null;
};

/** Which target a share-url request points at, before the owner is attached. */
export type ShareTarget =
  | { kind: ShareUrlKind.Action; actionId: number }
  | { kind: ShareUrlKind.ExternalTarget; externalTargetId: number }
  | { kind: ShareUrlKind.Invite };

/**
 * Resolve the loose `{ actionId?, externalTargetId?, invite? }` request shape
 * into a discriminated {@link ShareTarget}, enforcing that exactly one is set.
 */
function resolveTarget(params: {
  actionId?: number;
  externalTargetId?: number;
  invite?: boolean;
}): ShareTarget {
  const provided =
    Number(params.actionId !== undefined) +
    Number(params.externalTargetId !== undefined) +
    Number(params.invite === true);
  if (provided !== 1) {
    throw new BadRequestException(
      'Exactly one of actionId, externalTargetId, or invite must be provided',
    );
  }
  if (params.actionId !== undefined) {
    return { kind: ShareUrlKind.Action, actionId: params.actionId };
  }
  if (params.externalTargetId !== undefined) {
    return {
      kind: ShareUrlKind.ExternalTarget,
      externalTargetId: params.externalTargetId,
    };
  }
  return { kind: ShareUrlKind.Invite };
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
    invite?: boolean;
  }): Promise<string> {
    const { userId, actionId, externalTargetId, invite } = params;
    const target = resolveTarget({ actionId, externalTargetId, invite });
    const owner: ShareUrlOwner = { type: 'user', userId };
    const shareUrl = await this.getOrCreateForTarget(target, owner);
    return shareUrl.url;
  }

  private async getOrCreateForTarget(
    target: ShareTarget,
    owner: ShareUrlOwner,
  ): Promise<ShareUrl> {
    switch (target.kind) {
      case ShareUrlKind.Action:
        return this.getOrCreateForAction(target.actionId, owner);
      case ShareUrlKind.ExternalTarget:
        return this.getOrCreateForExternalTargetId(
          target.externalTargetId,
          owner,
        );
      case ShareUrlKind.Invite:
        return this.getOrCreateForInvite(owner);
      default:
        throw new Error(`unknown share target kind: ${target satisfies never}`);
    }
  }

  async createDuplicate(params: {
    owner: ShareUrlOwner;
    actionId?: number;
    externalTargetId?: number;
    invite?: boolean;
    label?: string;
  }): Promise<ShareUrl> {
    const { owner, actionId, externalTargetId, invite, label } = params;
    const target = resolveTarget({ actionId, externalTargetId, invite });
    const trimmedLabel = label?.trim();
    const labelValue = trimmedLabel ? trimmedLabel : null;
    switch (target.kind) {
      case ShareUrlKind.Action:
        return this.createDuplicateForAction(
          target.actionId,
          owner,
          labelValue,
        );
      case ShareUrlKind.ExternalTarget:
        return this.createDuplicateForExternalTargetId(
          target.externalTargetId,
          owner,
          labelValue,
        );
      case ShareUrlKind.Invite:
        return this.createDuplicateForInvite(owner, labelValue);
      default:
        throw new Error(`unknown share target kind: ${target satisfies never}`);
    }
  }

  private async createDuplicateForInvite(
    owner: ShareUrlOwner,
    label: string | null,
  ): Promise<ShareUrl> {
    return this.buildAndSaveRow(this.shareUrlRepository.manager, {
      kind: ShareUrlKind.Invite,
      owner,
      duplicate: true,
      label,
    });
  }

  async getOrCreateForInvite(owner: ShareUrlOwner): Promise<ShareUrl> {
    return this.getOrCreate(this.shareUrlRepository.manager, {
      kind: ShareUrlKind.Invite,
      owner,
    });
  }

  private async createDuplicateForExternalTargetId(
    externalTargetId: number,
    owner: ShareUrlOwner,
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
        owner,
        duplicate: true,
        label,
      });
    });
  }

  private async createDuplicateForAction(
    actionId: number,
    owner: ShareUrlOwner,
    label: string | null,
  ): Promise<ShareUrl> {
    return this.buildAndSaveRow(this.shareUrlRepository.manager, {
      kind: ShareUrlKind.Action,
      actionId,
      owner,
      duplicate: true,
      label,
    });
  }

  async findForOwner(owner: ShareUrlOwner): Promise<ShareUrl[]> {
    return this.shareUrlRepository.find({
      where: ownerWhere(owner),
      relations: { action: true, externalTarget: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findForUser(userId: number): Promise<ShareUrl[]> {
    return this.findForOwner({ type: 'user', userId });
  }

  async findInvitesForUser(userId: number): Promise<ShareUrl[]> {
    return this.shareUrlRepository.find({
      where: { user: { id: userId }, kind: ShareUrlKind.Invite },
      order: { duplicate: 'ASC', createdAt: 'DESC' },
    });
  }

  async createDuplicateInviteForUser(
    userId: number,
    label?: string,
  ): Promise<ShareUrl> {
    return this.createDuplicate({
      owner: { type: 'user', userId },
      invite: true,
      label,
    });
  }

  async updateInviteLabelForUser(
    id: string,
    userId: number,
    rawLabel: string | undefined,
  ): Promise<ShareUrl> {
    const trimmed = rawLabel?.trim();
    const nextLabel = trimmed ? trimmed : null;
    const row = await this.shareUrlRepository.findOne({
      where: { id, kind: ShareUrlKind.Invite },
    });
    if (!row || row.userId !== userId) {
      throw new NotFoundException('share url not found');
    }
    row.label = nextLabel;
    return this.shareUrlRepository.save(row);
  }

  async deleteInviteForUser(id: string, userId: number): Promise<void> {
    const row = await this.shareUrlRepository.findOne({
      where: { id, kind: ShareUrlKind.Invite },
    });
    if (!row || row.userId !== userId) {
      throw new NotFoundException('share url not found');
    }
    if (!row.duplicate) {
      throw new BadRequestException(
        'Your primary invite link cannot be deleted.',
      );
    }
    await this.shareUrlRepository.remove(row);
  }

  async deleteById(id: string): Promise<void> {
    const row = await this.shareUrlRepository.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('share url not found');
    }
    await this.shareUrlRepository.remove(row);
  }

  async findForCampaign(campaignId: number): Promise<ShareUrl[]> {
    return this.findForOwner({ type: 'campaign', campaignId });
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
    owner: ShareUrlOwner,
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
        owner,
      });
    });
  }

  async getOrCreateForAction(
    actionId: number,
    owner: ShareUrlOwner,
  ): Promise<ShareUrl> {
    return this.getOrCreate(this.shareUrlRepository.manager, {
      kind: ShareUrlKind.Action,
      actionId,
      owner,
    });
  }

  async findActionShareByActionAndSid(
    actionId: number,
    sid: string,
  ): Promise<ShareUrl | null> {
    return this.shareUrlRepository.findOne({
      where: { action: { id: actionId }, sid },
      relations: { user: true, campaign: true },
    });
  }

  async findByReferralSid(sid: string): Promise<ShareUrl | null> {
    return this.shareUrlRepository.findOne({
      where: { sid },
      relations: {
        user: true,
        campaign: true,
        action: true,
        externalTarget: true,
      },
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

  /**
   * Share links owned by a referring user (campaign-owned links, which have no
   * user, are excluded). Callers can safely treat `user` as non-null.
   */
  async findUserOwnedForAction(actionId: number): Promise<ShareUrl[]> {
    return this.shareUrlRepository.find({
      where: { action: { id: actionId }, user: Not(IsNull()) },
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
            ...ownerWhere(input.owner),
            action: { id: input.actionId },
            duplicate: false,
          };
        case ShareUrlKind.ExternalTarget:
          return {
            ...ownerWhere(input.owner),
            externalTarget: { id: input.externalTarget.id },
            duplicate: false,
          };
        case ShareUrlKind.Invite:
          return {
            ...ownerWhere(input.owner),
            kind: ShareUrlKind.Invite,
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
          case ShareUrlKind.Invite:
            return {
              url: withRef(signupUrl(true), sid),
              action: null,
              externalTarget: null,
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
      kind: input.kind,
      ...ownerColumns(input.owner),
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
