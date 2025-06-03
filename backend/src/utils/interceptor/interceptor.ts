import { InterceptorInterface, Interceptor, Action } from 'routing-controllers';
import { instanceToPlain } from 'class-transformer';
import { Service } from 'typedi';

@Service()
@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, result: any): any {
    const statusCode = action.response?.statusCode ?? 200;
    const success = statusCode >= 200 && statusCode < 400;

    if (success) {
      return {
        success: true,
        statusCode,
        data: instanceToPlain(result),
      };
    } else {
      return {
        success: false,
        statusCode,
        message: typeof result === 'string' ? result : result?.message || 'Error',
      };
    }
  }
}
