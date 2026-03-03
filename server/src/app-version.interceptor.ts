import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

const APP_VERSION = process.env.APP_VERSION ?? 'dev';

@Injectable()
export class AppVersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse();
    res.setHeader('X-App-Version', APP_VERSION);
    return next.handle();
  }
}
