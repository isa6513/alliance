import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';
@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  healthCheck(): string {
    return 'OK';
  }

  @Public()
  @Get('/test-error')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  testError(): string {
    throw new InternalServerErrorException(
      'something really bad happened (not really its just a test)',
    );
  }
}
