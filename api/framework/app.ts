import 'reflect-metadata';
import { Container } from 'typedi';
import { HttpErrorNotFound } from './httpError';
import express, { Express } from 'express';
import { AppRoute } from './interfaces/appRoute.interface';
import { AppController } from './appController';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Spring } from './spring';
import { importAll } from './importer';
import cls from 'cls-hooked';
import loggerFactory from '../src/infrastructure/bootstraping/loggers/logger';
const clsNamespace = cls.createNamespace('app');
const logger = loggerFactory();


const addHealthCheck = (app: any) => {
    app.get('/health', (req: any, res: any, next: any) => {
        res.json({ status: 'UP' });
    })
}

const tracerMiddleware = (req: any, res: any, next: any) => {
    clsNamespace.bind(req)
    clsNamespace.bind(res)
    clsNamespace.run(() => {
        clsNamespace.set('traceID', req.headers["x-san-correlationid"])
        next()
    })
}

const loggerMiddleware = (req: any, res: any, next: any) => {
    const traceId = clsNamespace.get('traceID')
    logger.info(`${traceId}: request: method: ${req.method} url: ${req.url} headers: ${JSON.stringify(req.headers)} body: ${JSON.stringify(req.body)}`)
    next()
}


export class App extends Spring {
    public static readonly PORT = 8080;
    private app: Express;
    private port: string | number;
    private static readonly controllerImporter = importAll(AppController, 'Controller.ts');

    constructor(config: { port?: string | number }) {
        super();
        this.app = express();
        this.port = config.port ?? App.PORT;
        this.configApp();
    }

    private configBasicMiddlewares(): void {
        addHealthCheck(this.app);
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(cors());
        this.app.use(tracerMiddleware);
        this.app.use(loggerMiddleware);
    }

    private addRoute({ path, middlewares, router }: AppRoute): void {
        const safeMiddleares = middlewares.map(middleware => this.createSafeMiddleware(middleware))
        this.app.use(path, ...safeMiddleares, router);
    }

    private configRoutes(): void {
        App.controllerImporter().forEach(AppRoute => {
            const appRoute: AppController = Container.get(AppRoute);
            this.addRoute(appRoute.getRoutes());
        });
    }

    private configErrorHandler(): void {
        this.app.use((req, res, next) => {
            const error = new HttpErrorNotFound();
            next(error)
        })

        this.app.use((err: any, req: any, res: any, next: any) => {
            console.log(err);
            res.status(err.status || 500).send({
                error: err.message
            })
        })
    }

    private configApp() {
        this.configBasicMiddlewares();
        this.configRoutes();
        this.configErrorHandler();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log("Escuchando en el puerto", this.port);
        })
    }
}