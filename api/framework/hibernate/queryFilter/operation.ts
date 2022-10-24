import { QueryOperation } from "../queryOption";

const getKeyQuery = (key: string) => key.split('.').filter(k => k).map(k => `"${k}"`).join('.');

type OperationQuery = (key: string, keyMap: string) => string;
type OperationParam = (key: string, keyMap: string) => {};

class Operation {
    constructor(
        public query: OperationQuery,
        public param: OperationParam = (key: string, value: any) => ({ [key]: value }),
        public isJoinOperation: boolean = false,
    ) { }
}

class MultipleOperation extends Operation {
    constructor(queryOption: QueryOperation, ...operations: Array<Operation>) {
        super(
            (key: string, mapKey: string = key) => `(${operations.map((operation, i) => operation.query(`${key}_${i}`, mapKey)).join(` ${queryOption} `)})`,
            (key: string, value: any) => operations.reduce((acu, operation, i) => ({ ...acu, ...operation.param(`${key}_${i}`, value) }), {}),
            true
        );
    }
}

const MultipleOperationCreator = (queryOption: QueryOperation) => (...operations: Array<Operation>) => new MultipleOperation(queryOption, ...operations);

const EQUALS: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} = :${key}`,
);

const DISTINCT: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} <> :${key}`,
);

const LOWER_THAN: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} < :${key}`,
);

const LOWER_THAN_EQUALS: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} <= :${key}`,
);

const GREATER_THAN: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} > :${key}`,
);

const GREATER_THAN_EQUALS: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} >= :${key}`,
);

const IS_NULL: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} IS NULL`,
    (key: string, value: any) => ({})
);

const IS_NOT_NULL: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} IS NOT NULL`,
    (key: string, value: any) => ({})
);

const IN: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} IN (:...${key})`,
);

const NOT_IN: Operation = new Operation(
    (key: string, mapKey: string = key) => `${getKeyQuery(mapKey)} NOT IN (:...${key})`,
);

const OR: (...operations: Array<Operation>) => MultipleOperation = MultipleOperationCreator(QueryOperation.OR)
const AND: (...operations: Array<Operation>) => MultipleOperation = MultipleOperationCreator(QueryOperation.AND)

export type SqlOperations = { [_: string]: Operation | ((...operations: Array<Operation>) => Operation) }

export const SqlOperation = {
    EQUALS,
    DISTINCT,
    LOWER_THAN,
    LOWER_THAN_EQUALS,
    GREATER_THAN,
    GREATER_THAN_EQUALS,
    IS_NULL,
    IS_NOT_NULL,
    IN,
    NOT_IN,
    OR,
    AND,
}
