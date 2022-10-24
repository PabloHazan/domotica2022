import { GetProperty } from './interfaces/customReuqestProperty';
import { DefineStatusCode } from './interfaces/defineStatusCode';
import { StatusCodes } from 'http-status-codes';
import { Router } from 'express';
import { AppRoute } from './interfaces/appRoute.interface';
import { Endpoint } from "./interfaces/endpoint.interdace";
import { IRequestContext } from './interfaces/request.interface';
import { HttpErrorBadRequest } from './httpError';
import { Spring } from './spring';
import { Downloable, isDowloable } from './interfaces/downloable.interface';
import { ResponseInterceptorType } from './decorators/responseInterceptor';

export abstract class AppController extends Spring {
    private middlewares!: Array<any>;
    private responseInterceptors!: Array<ResponseInterceptorType<any>>;
    private router: Router;

    constructor() {
        super();
        this.router = Router();
        if (!this.middlewares) {
            this.middlewares = new Array<any>();
        }
        if (!this.responseInterceptors) {
            this.responseInterceptors = new Array<ResponseInterceptorType<any>>();
        }
        this.initRoutes();
    }

    private getPath(): string { return '' }
    getRoutes(): AppRoute {
        return {
            path: this.getPath(),
            middlewares: this.middlewares,
            router: this.router,
        }
    };

    private mapRequestProperty(Class: any, json: any): any {
        return Object.entries(json).reduce((instance, [key, value]) => {
            const SubClass = instance.requestPropertiesDefinition?.[key];
            if (SubClass) {
                value = Array.isArray(value) ?
                    value.map(element => this.mapRequestProperty(SubClass, element)) :
                    this.mapRequestProperty(SubClass, value);
            }
            instance[key] = value;
            return instance;
        }, new Class());
    }

    private createSafeHandler(handler: Function, config: { [key: string]: any }, responseInterceptors: Array<ResponseInterceptorType<any>>) {
        return async (req: any, res: any, next: any) => {

            for (const name in config) {
                const Class = config[name];
                if (Class) {
                    const instance = this.mapRequestProperty(Class, req[name])
                    try {
                        instance.validate();
                    } catch (error) {
                        return next(new HttpErrorBadRequest(error.message));
                    }
                    req[name] = instance;
                }
            }

            let status: StatusCodes = StatusCodes.OK;
            const defineStatusCode: DefineStatusCode = (statusCode: StatusCodes) => status = statusCode;
            const getProperty: GetProperty = (key: string): any => req[key];
            try {
                const requestContext: IRequestContext = {
                    headers: req.headers,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    status: defineStatusCode,
                    getProperty,
                }
                let response = await handler.call(this, requestContext) ?? { status: 'ok' };
                for (const safeResponseInterceptor of responseInterceptors) {
                    response = await safeResponseInterceptor(response, requestContext);
                }
                if (isDowloable(response)) this.downloadFile(res, response);
                else res.status(status).send(response);
            } catch (error) {
                next(error);
            }
        }
    }

    private downloadFile(res: any, { filename, stream }: Downloable) {
        res.statusCode = 200;
        stream.on('end', () => res.end());
        res.attachment(filename);
        stream.pipe(res);
    }

    private registerEnpoint(handler: Function, { method, path, middlewares, responseInterceptors,  ...config }: Endpoint) {
        const safeResponseInterceptors = responseInterceptors;
        const safeHandler = this.createSafeHandler(handler, config, safeResponseInterceptors);
        const safeMiddlewares = middlewares.map(middlware => this.createSafeMiddleware(middlware));
        this.router[method](path, ...safeMiddlewares, safeHandler);
    }

    private initRoutes(): void {
        for (const key in this) {
            const property: any = this[key];
            const endpoint = property.endpoint;
            if (endpoint && endpoint.path && endpoint.method) {
                this.registerEnpoint(property, endpoint)
            }
        }
    }
}