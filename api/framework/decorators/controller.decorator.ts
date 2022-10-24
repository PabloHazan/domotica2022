import { Service } from "typedi";

const extractControllerName = (controllerName: string) => {
    const name: string = controllerName.replace('Controller', '');
    return name[0].toLowerCase() + name.slice(1);
}

export const Controller = (path?: string) => (target: any) => {
    Service()(target);
    target.prototype.getPath = () => `/${path ?? extractControllerName(target.name)}`;
}