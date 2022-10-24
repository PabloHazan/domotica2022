import { IMediatorHandlers } from "./types/iMediatorHandlers";
import { Validateable } from "../interfaces/validateable";
import { IRequest } from "./types/iRequest";

export abstract class MediatorRequestHandler<CommandQuery extends IRequest, T> {

    readonly handleClass!: typeof IRequest;

    abstract handler(commandQuery: CommandQuery): Promise<T>;
};
