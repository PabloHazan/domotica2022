import { Validateable } from "./validateable";


export interface IRequestProps {
    body?: new () => Validateable;
    query?: new () => Validateable;
    params?: new () => Validateable;
}
