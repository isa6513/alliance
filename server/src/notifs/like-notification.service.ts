import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationCategory,
} from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { ProfileDto } from 'src/user/user.dto';

export type LikeNotificationTarget = 'post' | 'comment' | 'activity';

@Injectable()
export class LikeNotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepository: Repository<Notification>,
  ) {}

  async createOrUpdate(params: {
    owner: User;
    liker: User;
    targetType: LikeNotificationTarget;
    targetId: number;
    webAppLocation: string;
    groupingKey?: string;
  }): Promise<void> {
    const { owner, liker, targetType, targetId, webAppLocation } = params;

    if (!owner || owner.id === liker.id) {
      return;
    }

    const groupingKey = params.groupingKey ?? `like:${targetType}:${targetId}`;

    const existingNotif = await this.notifRepository.findOne({
      where: {
        user: { id: owner.id },
        groupingKey,
        category: NotificationCategory.Likes,
        read: false,
        cleared: false,
      },
      relations: ['associatedUsers'],
    });

    if (existingNotif) {
      const nextCount = (existingNotif.groupingCount ?? 1) + 1;
      existingNotif.groupingCount = nextCount;
      existingNotif.message = this.buildMessage(targetType, nextCount);
      existingNotif.associatedUsers = [
        ...(existingNotif.associatedUsers ?? []),
        liker,
      ];
      await this.notifRepository.save(existingNotif);
      return;
    }

    const likerProfile = new ProfileDto(liker);
    const notification = this.notifRepository.create({
      user: owner,
      associatedUsers: [liker],
      category: NotificationCategory.Likes,
      message: this.buildMessage(targetType, 1, likerProfile.displayName),
      webAppLocation,
      groupingKey,
      groupingCount: 1,
    });
    await this.notifRepository.save(notification);
  }

  private buildMessage(
    targetType: LikeNotificationTarget,
    count: number,
    likerName?: string,
  ): string {
    const label =
      targetType === 'post'
        ? 'post'
        : targetType === 'comment'
          ? 'comment'
          : 'action activity';

    if (count === 1 && likerName) {
      return `${likerName} liked your ${label}`;
    }

    return `${count} people liked your ${label}`;
  }
}
