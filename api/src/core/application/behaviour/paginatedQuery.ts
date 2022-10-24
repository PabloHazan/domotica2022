import { Query } from "./query";
import { PaginatedQueryFilter } from "../../../../framework/hibernate/paginatedQueryFilter";

export abstract class PaginatedQuery<PaginatedFilter extends PaginatedQueryFilter> extends Query<PaginatedFilter> {
    offset: number = 0;
    limit: number = 10;
}