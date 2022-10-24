import { QueryFilter } from "../../../../framework/hibernate/queryFilter";
import { IRequest } from "../../../../framework/mediator/types/iRequest";

export abstract class Query<Filter extends QueryFilter | void = void> extends IRequest {
    abstract toFilter(): Filter;
}