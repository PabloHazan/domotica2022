import { IRequestMiddlewareContext } from "./interfaces/request.interface";
import { StatusCodes } from "http-status-codes";
import { DefineStatusCode } from "./interfaces/defineStatusCode";
import { AddProperty, GetProperty } from "./interfaces/customReuqestProperty";

export class Spring {
    protected createSafeMiddleware(middleware: (_: IRequestMiddlewareContext) => any) {
        return async (req: any, res: any, next: any) => {
            let status: StatusCodes | null = null;
            const defineStatusCode: DefineStatusCode = (statusCode: StatusCodes) => status = statusCode;
            const addProperty: AddProperty = (key: string, value: any) => { req[key] = value };
            const getProperty: GetProperty = (key: string): any => req[key];
            try {
                const requestContext: IRequestMiddlewareContext = {
                    headers: req.headers,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    status: defineStatusCode,
                    addProperty,
                    getProperty
                }
                await middleware(requestContext);
                next();
            } catch (error) {
                if (status) {
                    error.status = status;
                }
                next(error);
            }
        }
    }
}