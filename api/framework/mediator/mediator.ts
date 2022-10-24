import Container, { Service } from "typedi";
import { importAll } from "../importer";
import { IMediatorHandlers } from "./types/iMediatorHandlers";
import { IRequest } from "./types/iRequest";
import { MediatorRequestHandler } from "./mediatorRequestHandler";

@Service()
export class Mediator {

    private static readonly mediatorHandlerImporter = importAll(MediatorRequestHandler, 'Handler.ts');
    private handlers: IMediatorHandlers;

    constructor() {
        this.handlers = Mediator.mediatorHandlerImporter()
            .reduce(
                (handlers: IMediatorHandlers, mediatorHandlerClass: typeof MediatorRequestHandler) => {
                    const mediatorHandler: MediatorRequestHandler<any, any> = Container.get(mediatorHandlerClass as any);
                    return {
                        ...handlers,
                        [mediatorHandler.handleClass.name]: mediatorHandler,
                    };
                },
                {}
            );
    }

    async send<T>(request: IRequest): Promise<T> {
        const mediatorHandler: MediatorRequestHandler<IRequest, T> = this.handlers[request.constructor.name];
        if (!mediatorHandler) {
            throw new Error('Not handler implemented');
        }
        return await mediatorHandler.handler(request);
    }

    async publish<T>(notification: IRequest): Promise<void> {
        await this.send(notification);
    }

}