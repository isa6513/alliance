import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { SinchClient } from '@sinch/sdk-core';
import { SendSMSRequestData } from '@sinch/sms/dist/models';

@Injectable()
export class SmsService implements OnModuleInit {
  private sinchClient: SinchClient;
  private sinchNumber: string;

  private readonly logger = new Logger(SmsService.name);

  onModuleInit() {
    if (!process.env.SINCH_NUMBER) {
      throw new Error('SINCH_NUMBER is not set');
    }
    const projectId = process.env.SINCH_PROJECT_ID;
    const keyId = process.env.SINCH_KEY_ID;
    const keySecret = process.env.SINCH_KEY_SECRET;
    this.sinchNumber = process.env.SINCH_NUMBER;
    const region = process.env.SINCH_REGION; // Optional region

    if (!projectId || !keyId || !keySecret || !this.sinchNumber) {
      throw new Error('Sinch configuration is incomplete. Check .env file.');
    }

    this.sinchClient = new SinchClient({
      projectId,
      keyId,
      keySecret,
      ...(region && { smsRegion: region }),
    });

    this.sendSms('+16502728685', 'hi hi');
  }

  async sendSms(to: string, body: string) {
    if (!this.sinchClient) {
      // This case should ideally be prevented by the OnModuleInit check, but added for safety.
      this.logger.error('Sinch Client accessed before initialization.');
      throw new HttpException(
        'Sinch Client not initialized.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Basic validation: Check for '+' prefix for E.164
    if (!to.startsWith('+')) {
      this.logger.warn(
        `Recipient number '${to}' might not be in E.164 format. Prepending '+' might be needed.`,
      );
      // Note: This is a rudimentary check; robust E.164 validation/parsing (e.g., using google-libphonenumber) might be needed depending on input sources.
    }
    if (!this.sinchNumber.startsWith('+')) {
      this.logger.warn(
        `Sinch sender number '${this.sinchNumber}' might not be in E.164 format.`,
      );
    }

    const sendBatchRequest: SendSMSRequestData = {
      sendSMSRequestBody: {
        to: [to],
        from: this.sinchNumber,
        body: body,
      },
    };

    this.logger.log(`Attempting to send SMS to ${to}`);

    try {
      const response =
        await this.sinchClient.sms.batches.send(sendBatchRequest);
      this.logger.log(`SMS sent successfully. Batch ID: ${response.id}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${to}: ${error.message}`,
        error.stack,
      );

      // Example: Inspecting potential Sinch SDK error structure
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = `Sinch API error: ${error.message}`;

      // NOTE: The exact structure of the error object from the SDK might vary.
      // Inspect the actual error object during testing to confirm paths like 'error.response'.
      const sinchErrorCode = error?.response?.data?.error?.code;
      const sinchErrorMessage = error?.response?.data?.error?.message;
      const httpStatusCode = error?.response?.status; // Underlying HTTP status if available

      if (httpStatusCode === 401) {
        statusCode = HttpStatus.UNAUTHORIZED;
        message = 'Sinch authentication failed. Check API credentials.';
      } else if (
        httpStatusCode === 400 ||
        (sinchErrorCode && sinchErrorCode.toString().startsWith('40'))
      ) {
        // Example mapping for Bad Request
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Sinch Bad Request: ${sinchErrorMessage || error.message}`;
      } // Add more specific mappings based on Sinch error codes (e.g., 403 Forbidden, 503 Service Unavailable)

      // Re-throw as HttpException for NestJS to handle correctly in the controller layer
      throw new HttpException(message, statusCode);
    }
  }
}
