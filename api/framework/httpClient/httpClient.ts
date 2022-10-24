import axios, { AxiosInstance } from 'axios';
import https from 'https';
import cls from 'cls-hooked';
import axiosRetry from 'axios-retry';
import { Logger } from 'log4js'
import { DEFAULT_RETRIES } from '../../src/infrastructure/utils/constants';
import { ApiConfig, ExternalService } from '../../src/infrastructure/bootstraping/environments/types';
import environment from '../../src/infrastructure/bootstraping/environments';
import loggerFactory from '../../src/infrastructure/bootstraping/loggers/logger';

interface LoggerAxiosIstance extends AxiosInstance {
    logger: Logger | Console;
}

const clsNamespace = cls.getNamespace('app')!;

const JSONbeautify = (obj: any) => JSON.stringify(obj)

export const createHttpClient = (serviceName: ExternalService): LoggerAxiosIstance => {
    const logger: Logger | Console = loggerFactory(serviceName);
    const serviceConfig: ApiConfig = environment.externalServices[serviceName];
    const httpClient: AxiosInstance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        }),
        baseURL: serviceConfig.url,
        headers: serviceConfig.headers,
    })

    httpClient.interceptors.request.use(
        config => {
            const id = Math.random();
            const traceId = clsNamespace.get('traceID');
            if (traceId) {
                config.headers['X-SAN-CorrelationId'] = traceId
            }
            logger.info(`${traceId} request: ${config.method} ${config.url}`)
            logger.debug(`${traceId} request: headers ${JSONbeautify(config.headers)}, data ${JSONbeautify(config.data)}`)
            return { ...config, id };
        },
        error => {
            throw error;
        }
    )

    httpClient.interceptors.response.use(
        response => {
            const { config } = response
            const traceId = clsNamespace.get('traceID')
            logger.debug(`${traceId} response: ${config.method} ${config.url}, headers ${JSONbeautify(config.headers)}, status ${response.status}, data ${JSONbeautify(response.data)}`)
            return response
        },
        error => {
            const { config, response } = error
            const traceId = clsNamespace.get('traceID')
            try {
                logger.error(`${traceId} response error: ${config.method} ${config.url}, headers ${JSONbeautify(config.headers)}, data ${JSONbeautify(config.data)},response ${response.status}`)
                logger.debug(`${traceId} response error: data ${JSONbeautify(response.data)}`)
            } catch (er) {
                logger.error(`${traceId} response error: message "${error.message}"`)
            }
            throw error;
        }
    )

    const loggerAxiosClient: LoggerAxiosIstance = httpClient as LoggerAxiosIstance;
    loggerAxiosClient.logger = logger;

    axiosRetry(loggerAxiosClient, {
        retries: serviceConfig.retries || DEFAULT_RETRIES,
        retryDelay: axiosRetry.exponentialDelay
    });

    return loggerAxiosClient;
}

export abstract class ApiClient {
    client: LoggerAxiosIstance;

    protected get logger(): Console | Logger {
        return this.client.logger;
    }

    constructor() {
        const serviceName: string | undefined = this.constructor.name.match(/^(.+)ApiClient/)?.[1];
        if (!serviceName) {
            throw new Error(`No puede crearse el cliente http ${this.constructor.name}, el nombre debe cumplir con el formato '<serviceName>ApiClient'`);
        }
        this.client = createHttpClient(`${serviceName[0].toLowerCase()}${serviceName.slice(1)}Service` as ExternalService);
    }

}
