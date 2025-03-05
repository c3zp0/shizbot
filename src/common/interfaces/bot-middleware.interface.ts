import { MiddlewareFn } from 'grammy';
import { CustomContext } from '../types/custom-context.type';

export interface IBotMiddleware {
    handler: MiddlewareFn<CustomContext>;
}
