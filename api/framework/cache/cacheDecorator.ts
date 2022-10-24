import cache, { CacheConfig, CacheTime } from "./cache";

const createKey = (className: string, methodName: string, params: Array<any>): string => `[${className}:${methodName}(${params.map(p => JSON.stringify(p)).join(', ')})`;

const defaultCacheConfig: CacheConfig = {
    ttl: CacheTime.HOUR,
}

export const Cacheable = (bucketName: string, cacheConfig: CacheConfig = defaultCacheConfig) =>
    (target: any, methodName: string, methodDescriptor: PropertyDescriptor): void => {
        const method = methodDescriptor.value;
        methodDescriptor.value = async function (...params: Array<any>) {
            const key: string = createKey(target.constructor.name, methodName, params)
            let cachedValue: any = cache.findInBucket(bucketName, key);
            if (!cachedValue) {
                cachedValue = await method.apply(this, params);
                cache.setInBucket(bucketName, key, cachedValue, cacheConfig);
            }
            return cachedValue;
        }
    }

export const clearBucket = (bucketName: string) => {
    cache.removeBucket(bucketName);
}