
export interface IMapper<Tin, Tout> {
    map(entityIn: Tin): Tout | Promise<Tout>;
}