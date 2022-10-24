import { IRequestContext } from "../interfaces/request.interface";
export type ResponseInterceptorType<Response> = (response: Response, context: IRequestContext) => Response
export const ResponseInterceptor = <Response>(responseInterceptor: ResponseInterceptorType<Response>) => (target: any, methodName: string, methodDescriptor: PropertyDescriptor) => {
    methodDescriptor.value.endpoint.responseInterceptors.unshift(responseInterceptor);
}
