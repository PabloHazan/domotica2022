import { StatusCodes } from "http-status-codes";

export abstract class HttpError extends Error {
    status!: StatusCodes;
    constructor(status: StatusCodes, message: string) {
        super(message);
        this.status = status;
    }
}


export class HttpErrorNotFound extends HttpError {
    constructor(message = 'Not found') {
        super(StatusCodes.NOT_FOUND, message);
    }
}

export class HttpErrorUnauthorized extends HttpError {
    constructor() {
        super(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }
}

export class HttpErrorForbiden extends HttpError {
    constructor() {
        super(StatusCodes.FORBIDDEN, 'Forbidden');
    }
}

export class HttpErrorBadRequest extends HttpError {
    constructor(message: string = 'Bad request') {
        super(StatusCodes.BAD_REQUEST, message);
    }
}

export class HttpConflict extends HttpError {
    constructor(message: string = 'Conflict') {
        super(StatusCodes.CONFLICT, message);
    }
}
