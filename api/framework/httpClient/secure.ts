import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import { HttpErrorBadRequest } from '../httpError';
import { IRequestMiddlewareContext } from "../interfaces/request.interface";

const DEFAULT_EXTRASECRET = ''
const DEFAULT_SECURE_KEY_NAME: any = 'secureHash'

let _secret: string | undefined = undefined;

const _extractSecureObject = (keysToSecurized: Array<string>, object: any) => keysToSecurized.reduce(
    (acu, key) => ({ ...acu, [key]: object[key] }),
    {}
)

const _createHash = (str: string, extraSecret: string) => {
    const cryptoHash = crypto.createHmac('sha256', _secret + extraSecret)
    cryptoHash.update(str)
    return cryptoHash.digest('hex')
}

const _createSecureHash = (
    keysToSecurized: Array<string>,
    object: any,
    extraSecret: string
) => {
    const partialObject = _extractSecureObject(keysToSecurized, object)
    const base64 = Buffer.from(JSON.stringify(partialObject)).toString('base64')
    return _createHash(base64, extraSecret)
}

// object: object to validate or add secure key
// secureKeyName: name of the key where the security hash is added, by default is 'secureHash'
// returns: array of all keys of the object
const _getValidKeys = (
    object: any,
    secureKeyName: string
) => Object.keys(object).filter(key => key !== secureKeyName)

// keysToSecurized: Array<string> | undefined
//      if it is a list then are the keys to create the hash
//      use all keys except the value of secureKeyName
// secureKeyName: name of the key where the security hash is added, by default is 'secureHash'
// object: object to add the secure key
// extraSecret: additional key to generate the hash, by default it is the empty string
// returns: function that returns an object with the secure key
const _secureObjectCreator = (
    keysToSecurized: Array<string> | undefined,
    secureKeyName: string,
    object: any,
    extraSecret: string
) => {
    const secureHash = _createSecureHash(keysToSecurized || _getValidKeys(object, secureKeyName), object, extraSecret)
    return { ...object, [secureKeyName]: secureHash }
}

// keysToSecurized: Array<string> | undefined
//      if it is a list then are the keys to create the hash
//      use all keys except the value of secureKeyName
// secureKeyName: name of the key where the security hash is added, by default is 'secureHash'
// array: array to add the secure key
// extraSecret: additional key to generate the hash, by default it is the empty string
// returns: function that returns an array of the objects with the secure key
const _secureListCreator = (
    keysToSecurized: Array<string> | undefined,
    secureKeyName: string,
    array: Array<any>,
    extraSecret: string
) => array.map(object => _secureObjectCreator(keysToSecurized, secureKeyName, object, extraSecret))

// object: object or array to add the secure key
// returns: function to add the secure key
const _getSecureCreator = <Entity>(object: Entity | Array<Entity>) => Array.isArray(object) ?
    _secureListCreator :
    _secureObjectCreator

const _getSecureObjectValidator = (
    keysToSecurized: Array<string>,
    secureKeyName: string,
    extraSecret: string
) => (object: any) => {
    const secureHash = _createSecureHash(keysToSecurized || _getValidKeys(object, secureKeyName), object, extraSecret)
    if (object[secureKeyName] !== secureHash) throw new Error('Invalid object')
}

const _getSecureListValidator = (
    keysToSecurized: Array<string>,
    secureKeyName: string,
    extraSecret: string
) => (
    list: Array<any>
) => list
    .forEach(obj => _getSecureObjectValidator(keysToSecurized, secureKeyName, extraSecret)(obj))

const _getSecureValidator = (
    object: any,
    keysToSecurized: Array<string>,
    secureKeyName: string,
    extraSecret: string
) => (
    Array.isArray(object) ?
        _getSecureListValidator :
        _getSecureObjectValidator
)(keysToSecurized, secureKeyName, extraSecret)

// keysToSecurized: Array<string> | undefined
//      if it is a list then are the keys to create the hash
//      use all keys except the value of secureKeyName
// secureKeyName: name of the key where the security hash is added, by default is 'secureHash'
// object: object or array to add the secure key
// extraSecret: additional key to generate the hash, by default it is the empty string
// returns: object with security hash on the specified key
const _addSecureProp = <Entity, SecureKey extends string>(
    keysToSecurized: Array<keyof Entity> | undefined,
    secureKeyName: SecureKey
) => (object: Entity,
    extraSecret: string = DEFAULT_EXTRASECRET
) => {
        const secureCreator = _getSecureCreator<Entity>(object);
        return secureCreator(keysToSecurized as Array<string>, secureKeyName, object as any, extraSecret);
    }

// keysToSecurized: Array<string> | undefined
//      if it is a list then are the keys to create the hash
//      use all keys except the value of secureKeyName
// secureKeyName: name of the key where the security hash is added, by default is 'secureHash'
// object: {key: value}
// extraSecret: additional key to generate the hash, by default it is the empty string
// return: throw an exception if the object was modified
const _verifySecureProp = <Entity, SecureKey extends string>(
    keysToSecurized: Array<keyof Entity> | undefined,
    secureKeyName: SecureKey
) => (
    object: Entity,
    extraSecret = DEFAULT_EXTRASECRET
) => {
        const secureValidator = _getSecureValidator(object, keysToSecurized as Array<string>, secureKeyName, extraSecret)
        secureValidator(object as any)
    }

// req: express request
// src: key to obtain the object to be validated from the request.
//      If you need to navigate several levels they are separated with a dot, for example 'body.foo.bar'
// returns: object to validate
const _getToValidate = (context: IRequestMiddlewareContext, src: string) => src
    .split('.')
    .filter((key: string) => key)
    .reduce((acu: any, key: string) => acu[key], context)

// this function must be executed before you can use createSecureFunctions
// config.secret: string for hash all objects
interface ISecureConfig {
    secret: string;
}
export const configure = ({ secret }: ISecureConfig) => {
    _secret = secret
}

type SecureEntity<Entity, SecureKey extends string> = Entity & {
    [secureKey in SecureKey]: string
}

interface ISecureFunctions<Entity, SecureKey extends string> {
    addSecureProp: (entity: Entity, extraSecret?: string) => SecureEntity<Entity, SecureKey>;
    verifySecureProp: (entity: Entity, extraSecret?: string) => void;
}

// create the functions to add and validate hash into objects
// keysToSecurized: Array<string> | undefined
//      if it is a list then are the keys to create the hash
//      use all keys except the value of secureKeyName
// secureKeyName: name of the key where the security hash is added, by default is 'secureHash'
// returns:
//      addSecureProp: function to add security hash to an object
//      verifySecureProp: function to verify that an object has not been altered from its hash
export const createSecureFunctions = <Entity, SecureKey extends string = 'secureHash'>(
    keysToSecurized?: Array<keyof Entity>,
    secureKeyName: SecureKey = DEFAULT_SECURE_KEY_NAME
): ISecureFunctions<Entity, SecureKey> => ({
    addSecureProp: _addSecureProp<Entity, SecureKey>(keysToSecurized, secureKeyName),
    verifySecureProp: _verifySecureProp<Entity, SecureKey>(keysToSecurized, secureKeyName),
})

// verifySecureProp: verification function created by createSecureFunctions
// src: key to obtain the object to be validated from the request.
//      If you need to navigate several levels they are separated with a dot, for example 'body.foo.bar'
// errorMessage: error message in case the object has been modified
// getExtraSecret: optional, function that receives the request and the additional key to generate the hash
// returns: express middleware that validates that the object has not been altered
interface ISecureMiddlewareConfig {
    src: string;
    errorMessage: string;
    getExtraSecret?: (context: IRequestMiddlewareContext) => string;
}


export const createSecureMiddleware = (
    verifySecureProp: any,
    { src, errorMessage, getExtraSecret }: ISecureMiddlewareConfig
) => (context: IRequestMiddlewareContext) => {
    try {
        const extraSecret = getExtraSecret?.(context) ?? DEFAULT_EXTRASECRET;
        const toValidate = _getToValidate(context, src);
        verifySecureProp(toValidate, extraSecret);
        return;
    } catch (error) {
        throw new HttpErrorBadRequest(errorMessage);
    }
}
