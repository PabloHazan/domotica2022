import { Validateable } from "./validateable";

export interface MethodConfig {
    path?: string,
    body?: typeof Validateable,
    query?: typeof Validateable,
    params?: typeof Validateable,
}