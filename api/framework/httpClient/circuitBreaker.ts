import CircuitBreaker from 'opossum';
import path from 'path';
import { AxiosError } from 'axios';

const ignoreError = (error: AxiosError): boolean => !error.response || !error.response.status ||
    (error.response.status < 500 || error.response.status > 599) && // status !== 5xx
    error.response.status !== 408

interface CircuitBreakerOptions {
    timeout?: number;
    volumeThreshold?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    name?: string;
    group?: string;
}

const createOptions = (name: string, options: CircuitBreakerOptions): CircuitBreakerOptions => ({
    timeout: 25000,
    volumeThreshold: 4,
    errorThresholdPercentage: 50,
    resetTimeout: 5000,
    name,
    group: path.basename(module.parent!.filename, '.js'),
    ...options
});



const createBreackeableMethod = (method: any) => async (...params: any) => {
    try {
        return await method(...params);
    } catch (error) {
        if (ignoreError(error as AxiosError)) {
            return { breakerError: error };
        } else {
            throw error;
        }
    }
}

export const WithBreaker = (circuitBreakerOptions: CircuitBreakerOptions = {}) =>
    (target: any, methodName: string, methodDescriptor: PropertyDescriptor): void => {
        const options = createOptions(methodName, circuitBreakerOptions);
        const method = methodDescriptor.value;
        let circuitBreaker: CircuitBreaker;
        methodDescriptor.value =  async function (...args: Array<any>) {
            if (!circuitBreaker) circuitBreaker = new CircuitBreaker(createBreackeableMethod(method.bind(this)), options);
            const response: any = await circuitBreaker.fire(...args);
            if (response.breakerError) throw response.breakerError;
            return response;
        }
    }