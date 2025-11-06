import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { Public } from './auth/public.decorator';
import { register } from './metrics';

export class BugReportDto {
  @ApiProperty({ description: 'The description of the bug' })
  @IsDefined()
  description: string;
}

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

  @Get('/metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  async metrics(): Promise<string> {
    return register.metrics();
  }
}
