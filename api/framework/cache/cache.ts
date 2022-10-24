import Container, { Service } from "typedi";

export enum CacheTime {
    SECOND = 1,
    MINUTE = 60 * SECOND,
    HOUR = 60 * MINUTE,
    INFINITY = 0,
}

export interface CacheConfig {
    ttl?: CacheTime,
}

@Service()
class Cache {
    constructor() {
        this.buckets = new Map();
    }

    private buckets: Map<string, Map<string, any>>;

    createBucket(bucketName: string) {
        if (!this.buckets.has(bucketName)) {
            this.buckets.set(bucketName, new Map());
        }
    }
    removeBucket(bucketName: string) {
        const bucket: Map<string, any> = this.buckets.get(bucketName)!;
        if (bucket) {
            bucket.clear();
        }
        this.buckets.delete(bucketName);
    }
    findInBucket(bucketName: string, cachedName: string): any {
        return this.buckets.get(bucketName)?.get(cachedName);
    }
    setInBucket(bucketName: string, cachedName: string, value: any, { ttl }: CacheConfig) {
        this.createBucket(bucketName);
        const bucket: Map<string, any> = this.buckets.get(bucketName)!;
        bucket.set(cachedName, value);
        if (ttl) {
            setTimeout(() => {
                this.removeInBucket(bucketName, cachedName);
            }, ttl);
        }
    }
    removeInBucket(bucketName: string, cachedName: string) {
        const bucket = this.buckets.get(bucketName)!;
        bucket.delete(cachedName);
    }
}

const cache: Cache = Container.get(Cache)

export default cache;