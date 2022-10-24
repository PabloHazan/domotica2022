import { App } from './../../framework/app';
import { ApplicationStartup } from '../infrastructure/bootstraping/ApplicationStartup';
import environment from '../infrastructure/bootstraping/environments';

export class EnableCardsBff {
    static async init() {
        const appStartup = new ApplicationStartup();
        try {
            await appStartup.configureServices();
            const app: App = new App({
                port: environment.port,
            });
            app.listen();
        } catch (error) {
            console.log(error)
        }
    }
}

EnableCardsBff.init();