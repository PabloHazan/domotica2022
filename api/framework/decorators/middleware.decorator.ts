const controllerMiddleware = (target: any) => (middleware: any) => {
    if (!target.prototype.middlewares) {
        target.prototype.middlewares = [];
    }
    target.prototype.middlewares.unshift(middleware);
}

const enpointMiddleware = (target: any, methodDescriptor: PropertyDescriptor) => (middleware: any) => {
    methodDescriptor.value.endpoint.middlewares.unshift(middleware);
}

export const Middleware = (middleware: any) => (target: any, methodName?: string, methodDescriptor?: PropertyDescriptor) => {
    const setMiddleware = methodName ? enpointMiddleware(target, methodDescriptor!) : controllerMiddleware(target);
    setMiddleware(middleware);
}
