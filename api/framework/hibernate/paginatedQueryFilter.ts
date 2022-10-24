import { PaginatedQuery } from "../../src/core/application/behaviour/paginatedQuery";
import { QueryFilter } from "./queryFilter";

export abstract class PaginatedQueryFilter extends QueryFilter {
    offset: number;
    limit: number;
    paginated: boolean;

    constructor(offsetOrQuery: number | PaginatedQuery<any> = 0, limit: number = 10) {
        super();

        if (offsetOrQuery instanceof PaginatedQuery) {
            const query: PaginatedQuery<any> = offsetOrQuery;
            this.offset = query.offset;
            this.limit = query.limit;
        } else {
            const offset: number = offsetOrQuery;
            this.offset = offset;
            this.limit = limit;
        }

        this.paginated = true;
    }

    getInoredKeys(): Array<string> {
        return [
            'offset',
            'limit',
            'paginated',
        ]
    }
}