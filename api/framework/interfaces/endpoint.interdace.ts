import { ResponseInterceptorType } from "../decorators/responseInterceptor";
import { Method } from "../enum/methods.enum";
import { Validateable } from "./validateable";

export interface Endpoint {
    path: string;
    method: Method;
    middlewares: Array<any>;
    responseInterceptors: Array<ResponseInterceptorType<any>>
    body?: typeof Validateable,
    query?: typeof Validateable,
    params?: typeof Validateable,
}
