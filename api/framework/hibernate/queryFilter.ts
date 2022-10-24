import { SqlOperation } from "./queryFilter/operation";
import { QueryOperation } from "./queryOption";
import { SqlOperations } from './queryFilter/operation'

const getOperation = (operations: any, key: string) => operations[key] ?? SqlOperation.EQUALS;

export abstract class QueryFilter {
    orderBy?: string;
    asc: boolean
    operations: SqlOperations;
    joinOperation: QueryOperation;

    constructor() {
        this.asc = true;
        this.operations = {};
        this.joinOperation = QueryOperation.AND
    }

    getQuery(mappers: any = {}): string {
        return Object.entries(this)
            .reduce(
                (contidions: Array<string>, [key, value]: [string, any]) => {
                    if (this.filterIgnore(key, value) && !this.getInoredKeys().includes(key)) {
                        contidions.push(getOperation(this.operations, key).query(key, mappers[key]));
                    }
                    return contidions;
                },
                new Array<string>(),
            ).join(` ${this.joinOperation} `);
    }

    getQueryParams(): { [key: string]: any } {
        return Object.entries(this)
            .reduce(
                (params: any, [key, value]) => {
                    if (this.filterIgnore(key, value) && !this.getInoredKeys().includes(key)) {
                        const operation = getOperation(this.operations, key);
                        params = { ...params, ...operation.param(key, value) }
                    }
                    return params;
                },
                {}
            )
    }

    private filterIgnore(key: string, value: any) {
        return key !== 'getQuery' &&
            key !== 'filterIgnore' &&
            key !== 'getInoredKeys' &&
            key !== 'getQueryParams' &&
            key !== 'orderBy' &&
            key !== 'asc' &&
            key !== 'operations' &&
            key !== 'joinOperation' &&
            value !== null &&
            value !== undefined
    }

    getInoredKeys(): Array<string> {
        return new Array<string>();
    }
}