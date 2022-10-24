import { PaginatedQueryFilter } from "./paginatedQueryFilter";

export class BasicFilter extends PaginatedQueryFilter {
    [_: string]: any;
    constructor(filter: any) {
        super();
        this.paginated = false;
        Object.entries(filter).forEach(([key, value]) => this[key] = value);
    }
}