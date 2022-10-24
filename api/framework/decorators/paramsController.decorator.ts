const AlterParam = (src: 'headers' | 'params' | 'query' | 'body', name?: string) => (target: any, methodName: string, index: number) => {
    const method = target[methodName];
    const alterParam: ParamsController = { src, name };
    if (!method.alterParams) {
        method.alterParams = new Array<ParamsController>();
    }
    method.alterParams.unshift(alterParam);
}

const ControllerParam = (src: 'headers' | 'params' | 'query') => (name: string) => AlterParam(src, name)

export const HeaderParam = ControllerParam('headers');
export const UrlParam = ControllerParam('params');
export const QueryParam = ControllerParam('query');
export const QueryParams = AlterParam('query');
export const Body = AlterParam('body');