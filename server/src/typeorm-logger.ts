/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger as NestLogger } from '@nestjs/common';
import { PostHog } from 'posthog-node';

export class AppTypeOrmLogger implements TypeOrmLogger {
  private readonly logger = new NestLogger('TypeORM');
  private readonly client: PostHog;

  constructor() {
    this.client = new PostHog(process.env.POSTHOG_KEY!, {
      host: 'https://us.i.posthog.com',
    });
    console.log(this.client.apiKey);
  }

  logQuery() {}

  logQueryError(error: string | Error, query: string, parameters?: any[]) {
    this.logger.error({
      event: 'db.query_error',
      sql: query,
      params: this.safeParams(parameters),
      error: error instanceof Error ? error.message : error,
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    this.logger.warn({
      event: 'db.slow_query',
      durationMs: time,
      sql: query,
      params: this.safeParams(parameters),
    });
    this.client.capture({
      distinctId: 'server',
      event: 'db.slow_query',
      properties: {
        durationMs: time,
        sql: query,
      },
    });
  }

  logSchemaBuild(message: string) {
    this.logger.log({ event: 'db.schema_build', message });
  }

  logMigration(message: string) {
    this.logger.log({ event: 'db.migration', message });
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    if (level === 'warn') this.logger.warn(message);
    else this.logger.log(message);
  }

  private safeParams(params?: any[]) {
    if (!params) return undefined;
    return params.map((p) => {
      if (typeof p === 'string' && p.length > 256) return '[long-string]';
      return p;
    });
  }
}
