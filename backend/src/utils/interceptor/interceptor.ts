import { InterceptorInterface, Interceptor, Action } from "routing-controllers";
import { instanceToPlain } from "class-transformer";
import { Service } from "typedi";

@Service()
@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, result: any): any {
    // Nếu kết quả đã có dạng { success, data, ... } thì trả về nguyên bản
    if (result && typeof result === "object" && "success" in result && "data" in result) {
      return instanceToPlain(result);
    }
    // Nếu không, chỉ trả về instanceToPlain(result)
    return instanceToPlain(result);
  }
}
