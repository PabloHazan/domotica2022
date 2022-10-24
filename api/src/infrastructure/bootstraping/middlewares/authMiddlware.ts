import { HttpErrorUnauthorized } from './../../../../framework/httpError';
import { IRequestMiddlewareContext } from '../../../../framework/interfaces/request.interface';
import jwtDecode from 'jwt-decode'
import { USERNAME_CONTEXT_KEY } from '../../utils/constants';

interface TokenPayload {
    username: string;
}

export const AuthMiddleware = (context: IRequestMiddlewareContext) => {
    try {
        const jwt = context.headers.authorization;
        const payload: TokenPayload = (jwtDecode(jwt) as TokenPayload);
        const username: string = payload.username;
        context.addProperty<string>(USERNAME_CONTEXT_KEY, username);
    } catch (err) {
        throw new HttpErrorUnauthorized();
    }
}
