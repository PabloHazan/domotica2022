import { Method } from "../enum/methods.enum";
import { IRequestProps } from "./IRequestProps";

export interface Endpoint extends IRequestProps {
    path: string;
    method: Method;
    middlewares: Array<any>;
}
