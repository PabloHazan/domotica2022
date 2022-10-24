import environment from "../environments";
import log4js from 'log4js';

const defaultLevel = 'INFO';
const defaultAppender = { type: 'stdout' };

const logConfig = environment.logConfig ?? { logLevel: defaultLevel, appender: defaultAppender };
const { logLevel = defaultLevel, appender = defaultAppender } = logConfig;

interface ILog4jsConfig {
    appenders: {
        [key: string]: any;
    };
    categories: {
        [name: string]: {
            appenders?: Array<string>;
            level: string;
        }
    };
}

const log4jsConfig: ILog4jsConfig = {
    appenders: {
        app: appender || defaultAppender
    },
    categories: {
        default: {
            appenders: ['app'],
            level: logLevel
        }
    }
};

log4js.configure(log4jsConfig as any);

export default log4js.getLogger;