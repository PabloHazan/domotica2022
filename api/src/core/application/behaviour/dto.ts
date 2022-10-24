import { Validateable } from '../../../../framework/interfaces/validateable';
export abstract class Dto<Domain> extends Validateable {
    constructor(domain: Domain) {
        super();
        this.fromDomain(domain);
    }

    protected abstract fromDomain(domain: Domain): void;
}