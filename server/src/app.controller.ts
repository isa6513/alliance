import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { Public } from './auth/public.decorator';

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

  @Public()
  @Get('/test-error')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  testError(): string {
    throw new InternalServerErrorException(
      'something really bad happened (not really its just a test)',
    );
  }

  //   @UseGuards(AuthGuard)
  //   @Post('/bug-report')
  //   @ApiOkResponse()
  //   bugReport(@Body() body: BugReportDto, @Request() req: JwtRequest) {
  //     const client = new PostHog(process.env.POSTHOG_KEY!, {
  //       host: 'https://us.i.posthog.com',
  //     });

  //     client.capture({
  //       distinctId: uuidv4(),
  //       event: 'bug-report',
  //       properties: {
  //         description: body.description,
  //         user: req.user.email,
  //       },
  //     });
  //   }
}
