import { IRequest } from "../types/iRequest";
import { Service } from "typedi";

export const Handler = (handleClass: typeof IRequest) => (target: any) => {
    Service()(target);
    target.prototype.handleClass = handleClass
}