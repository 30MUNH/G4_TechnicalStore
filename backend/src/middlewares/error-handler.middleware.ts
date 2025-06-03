import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, req: any, res: any, next: (err?: any) => any): void {
    const statusCode = error.httpCode || error.status || 500;
    const message = error.message || 'Internal server error';

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }
}
