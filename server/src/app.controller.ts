import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { Public } from './auth/public.decorator';
import { ApiOkResponse } from '@nestjs/swagger';
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
}
