import { IRequestContext } from './../interfaces/request.interface';
import { Endpoint } from './../interfaces/endpoint.interdace';
import { Method } from "../enum/methods.enum";
import { MethodConfig } from '../interfaces/methodConfig.interface';

const registerEndpoint = (method: Method, config: MethodConfig | undefined, target: any, handler: any) => {
    const finalPath = `/${config?.path || ''}`;
    if (!target.endpoints) {
        target.endpoints = new Array<Endpoint>();
    }
    const endpoint: Endpoint = {
        path: finalPath,
        method,
        middlewares: [],
        responseInterceptors: [],
        body: config?.body,
        query: config?.query,
    }
    handler.endpoint = endpoint;
}

const createDescriptor = (methodDescriptor: PropertyDescriptor): PropertyDescriptor => {
    const method = methodDescriptor.value;
    methodDescriptor.value = function (context: IRequestContext) {
        const params: Array<any> = method.alterParams?.map((alteredMethodParam: ParamsController) => alteredMethodParam.name ?
            context[alteredMethodParam.src][alteredMethodParam.name] :
            context[alteredMethodParam.src]
        ) ?? [];
        return method.call(this, ...params, context);
    }
    return methodDescriptor;
}

const genericMethod = (method: Method) => (config?: MethodConfig) => (target: any, methodName: string, methodDescriptor: PropertyDescriptor): void => {
    const alteredDescriptor: PropertyDescriptor = createDescriptor(methodDescriptor)
    registerEndpoint(method, config, target, alteredDescriptor.value)
}

export const Get = genericMethod(Method.GET);
export const Post = genericMethod(Method.POST);
export const Put = genericMethod(Method.PUT);
export const Patch = genericMethod(Method.PATCH);
export const Delete = genericMethod(Method.DELETE);