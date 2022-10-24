import { IMediatorHandlerMethod } from "./iMediatorHandlerMethod";
import { MediatorRequestHandler } from "../mediatorRequestHandler";

export interface IMediatorHandlers {
    [iRequestClassName: string]: MediatorRequestHandler<any, any>;
};