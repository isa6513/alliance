import { Controller, Get, Header, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { HealthCheckDto } from './app.dto';
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
  @ApiOkResponse({ type: HealthCheckDto })
  healthCheck(): HealthCheckDto {
    return { status: 'OK' };
  }

  /**
   * Prometheus scrape target: returns the exposition text format, so the body
   * must stay as a primitive string rather than a DTO — JSON-wrapping it would
   * break scraping.
   */
  @Get('/metrics')
  @Header('Content-Type', register.contentType)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  async metrics(): Promise<string> {
    return register.metrics();
  }
}
