import { AddProperty, GetProperty } from './customReuqestProperty';
import { DefineStatusCode } from './defineStatusCode';
import { Validateable } from './validateable';

export interface IRequestContext {
    headers: { [key: string]: any };
    params: Validateable | any;
    query: Validateable | any;
    body: Validateable | any;
    status: DefineStatusCode;
    getProperty: GetProperty;
}

export interface IRequestMiddlewareContext extends IRequestContext {
    addProperty: AddProperty;
}
