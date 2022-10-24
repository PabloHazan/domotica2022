export abstract class DataObject<ApiType> {

    protected abstract fromApi(api: ApiType): void;

    constructor(api?: ApiType) {
        if (api) this.fromApi(api);
    }
}