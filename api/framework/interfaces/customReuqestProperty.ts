export type AddProperty = <PropertyType>(key: string, value: PropertyType) => void;

export type GetProperty = <PropertyType>(key: string) => PropertyType;