export const MapProperty = (Class: any) => (target: any, propertyName: string): void => {
    if (!target.requestPropertiesDefinition) target.requestPropertiesDefinition = {};
    target.requestPropertiesDefinition[propertyName] = Class;
    const oldValidate = target.validate;
    target.validate = function () {
        oldValidate.bind(this)();
        const property = this[propertyName];
        if (Array.isArray(property)) property.forEach(item => item.validate());
        else this[propertyName].validate();
    }
    return;
}
