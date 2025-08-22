import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from 'src/images/images.module';
import { ActionActivity } from '../actions/entities/action-activity.entity';
import { Action } from '../actions/entities/action.entity';
import { City } from '../geo/city.entity';
import { Notification } from '../notifs/entities/notification.entity';
import { Friend } from './friend.entity';
import { PrefillUser } from './prefill-user.entity';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { IsUserAlreadyExist } from './validators/user-already-exists.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Action]),
    TypeOrmModule.forFeature([ActionActivity]),
    TypeOrmModule.forFeature([Friend]),
    TypeOrmModule.forFeature([City]),
    TypeOrmModule.forFeature([Notification]),
    TypeOrmModule.forFeature([PrefillUser]),
    JwtModule,
    ImagesModule,
  ],
  controllers: [UserController],
  providers: [UserService, IsUserAlreadyExist],
  exports: [UserService],
})
export class UserModule implements OnModuleInit {
  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    if (process.env.ADMIN_USER) {
      const user = await this.userService.findOneByEmail(
        process.env.ADMIN_USER,
      );
      if (user) {
        await this.userService.setAdmin(user.id, true);
      } else {
        await this.userService.create({
          email: process.env.ADMIN_USER,
          password: process.env.ADMIN_PASSWORD,
          name: 'Admin',
          admin: true,
        });
      }
    }
  }
}
