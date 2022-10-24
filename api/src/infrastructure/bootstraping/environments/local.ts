import { EnvironmentConfig } from "./types";

const local: EnvironmentConfig = {
    port: process.env.port || 8082,
    logConfig: {
        logLevel: 'ALL',
    },
    mosquitto: {
        clientId: 'domitica2022server',
        ip: '127.0.0.1',
        port: 1883
    }
}

export default local;
