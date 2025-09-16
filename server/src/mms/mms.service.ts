// src/mms/mms.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Twilio from 'twilio'; // Use wildcard import for Twilio namespace
import { Repository } from 'typeorm';
import { Mms } from './mms.entity';

@Injectable()
export class MmsService {
  private readonly logger = new Logger(MmsService.name);
  private twilioClient: Twilio.Twilio;
  private twilioPhoneNumber: string;

  constructor(
    @InjectRepository(Mms)
    private readonly mmsRepository: Repository<Mms>,
  ) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

    if (!accountSid || !authToken || !this.twilioPhoneNumber) {
      this.logger.error(
        'Twilio configuration (Account SID, Auth Token, Phone Number) is missing or invalid.',
      );
      throw new InternalServerErrorException(
        'Twilio configuration is missing or invalid.',
      );
    }

    try {
      this.twilioClient = Twilio(accountSid, authToken); // Initialize Twilio client
      this.logger.log('Twilio client initialized successfully.');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize Twilio client: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Failed to initialize Twilio client: ${errorMessage}`,
      );
    }
  }

  /**
   * Sends an MMS message using Twilio.
   * @param to The recipient's phone number in E.164 format (e.g., +15551234567).
   * @param body The text body of the message.
   * @param mediaUrls An array of publicly accessible URLs for the media attachments (up to 10).
   * @returns A Promise resolving to the Twilio MessageInstance.
   */
  async sendMms(
    to: string,
    body: string,
    mediaUrls: string[],
  ): Promise<Mms | null> {
    this.logger.log(
      `Attempting to send MMS to ${to} with ${mediaUrls.length} media items.`,
    );

    if (mediaUrls.length === 0) {
      this.logger.warn('No media URLs provided. Sending as SMS instead.');
      // Note: Twilio automatically sends as SMS if mediaUrl is empty/omitted,
      // but the DTO currently requires mediaUrls. Modify DTO if SMS fallback is desired.
    }
    if (mediaUrls.length > 10) {
      this.logger.error(
        `Cannot send more than 10 media items. Provided: ${mediaUrls.length}`,
      );
      // Use BadRequestException as this is a client-provided data issue
      throw new BadRequestException(
        'Exceeded maximum number of media attachments (10).',
      );
    }

    try {
      const message = await this.twilioClient.messages.create({
        to: to,
        from: this.twilioPhoneNumber,
        body: body,
        mediaUrl: mediaUrls, // Pass the array directly
      });

      this.logger.log(`MMS sent successfully! Message SID: ${message.sid}`);

      const mms = this.mmsRepository.create({
        to: to,
        from: this.twilioPhoneNumber,
        body: body,
        twilioSid: message.sid,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      });

      return this.mmsRepository.save(mms);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send MMS to ${to}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  async refreshMmsData(mms: Mms): Promise<Mms> {
    const message = await this.twilioClient.messages.get(mms.twilioSid).fetch();

    return this.mmsRepository.save({
      ...mms,
      ...message,
    });
  }
}
