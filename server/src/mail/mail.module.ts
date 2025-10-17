import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { Mail } from './mail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailgunWebhookController } from './mailgun.webhook.controller';

@Module({
  providers: [MailService],
  controllers: [MailgunWebhookController],
  exports: [MailService],
  imports: [TypeOrmModule.forFeature([Mail])],
})
export class MailModule {}
