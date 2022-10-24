export class DomainError extends Error {
    constructor(cause: string) {
        super(`Error de dominio: ${cause}`);
        Object.setPrototypeOf(this, DomainError.prototype);
    }
}