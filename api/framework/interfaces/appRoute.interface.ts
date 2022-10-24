import { Router } from 'express';
export interface AppRoute {
    path: string;
    middlewares: Array<any>,
    router: Router;
}