import { HttpMessages } from '@/exceptions/http-messages.constant';
import { instanceToPlain } from 'class-transformer';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, req: any, res: any, next: (err?: any) => any): void {
    let status: number = error.httpCode || error.status || 500;
    let message: string | string[] = error.message || 'Something went wrong';

    if (error instanceof JsonWebTokenError) {
      status = 401;
      message = HttpMessages._UNAUTHORIZED;
    }

    const parsed = instanceToPlain(error);
    const validatorErrors = [];

    if (parsed.errors?.length > 0) {
      for (const i of parsed.errors) {
        const keys = Object.keys(i.constraints || {});
        if (keys.length > 0) {
          validatorErrors.push(i.constraints[keys[0]]);
        }
      }
      message = [...validatorErrors];
    }
    res.status(status).json({ success: false, message });
  }
}
