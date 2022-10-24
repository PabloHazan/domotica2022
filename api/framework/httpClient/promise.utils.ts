interface ISafePromiseSucces<Result> {
    success: Result;
}

interface ISafePromiseError<Error> {
    error: Error;
}

type ISafePromise<Result, Error> = ISafePromiseSucces<Result> | ISafePromiseError<Error>;

export interface SecurePromiseResults<Result, Error = any> {
    successful: Array<Result>;
    errors: Array<Error>;
}

export const createSafePromise = async <Result, Error = any>(promise: Promise<Result>): Promise<ISafePromise<Result, Error>> => {
    try {
        const success = await promise;
        return { success }
    } catch (error) {
        return { error }
    }
}

const createInstanceOfChecker = <Type>(...keys: Array<string>) => (obj: any): obj is Type => keys.every(key => key in obj);
const instanceOfSafePromiseError = <Result, Error>(obj: ISafePromise<Result, Error>): obj is ISafePromiseError<Error> => createInstanceOfChecker<ISafePromiseError<Error>>('error')(obj)

export const handleArrayPromise = async <Result, Error = any>(...promises: Array<any>): Promise<SecurePromiseResults<Result, Error>> => (
    (await Promise.all(promises.map(promise => createSafePromise<Result, Error>(promise))))
).reduce((results, promiseResult) => {
    if (instanceOfSafePromiseError<Result, Error>(promiseResult)) results.errors.push(promiseResult.error)
    else results.successful.push(promiseResult.success)
    return results;
},
    { successful: new Array<Result>(), errors: new Array<Error>() }
)

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

const getParamNames = (fn: any) => {
    var fnStr = fn.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export const createDescritivePromise = (fn: any) => async (...parameters: Array<any>) => {
    try {
        return await fn(...parameters);
    } catch (error) {
        error.parameters = getParamNames(fn).reduce((acu: any, paramName: string, index: number) => ({ ...acu, [paramName]: parameters[index] }), {});
        throw error;
    }

}

export class ErrorEntityWithMessage<Entity> extends Error {
    constructor(
        message: string,
        public entity: Entity,
    ) {
        super(message);
        Object.setPrototypeOf(this, ErrorEntityWithMessage.prototype);
    }
}
