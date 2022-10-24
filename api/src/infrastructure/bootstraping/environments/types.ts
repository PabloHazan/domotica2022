export interface LogConfig {
    logLevel: string;
    appender?: any
}

export interface MosquittoConfig {
    ip: String;
    port: number;
    clientId: string
}
export interface EnvironmentConfig {
    port: string | number;
    logConfig: LogConfig;
    mosquitto: MosquittoConfig
}