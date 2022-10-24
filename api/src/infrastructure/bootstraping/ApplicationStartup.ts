import { BaseAppStartup } from './BaseAppsStartup';
import environment from './environments';
// import { configure } from '../../../framework/httpClient/secure';
import { Mosquitto } from '../../../framework/mosquitto';

export class ApplicationStartup extends BaseAppStartup {
    async configureServices() {
        super.configureServices()
        await Mosquitto.init(
            environment.mosquitto.ip,
            environment.mosquitto.port,
            environment.mosquitto.clientId,
            () => console.log('Mosquitto conectado')
        );
    }
}