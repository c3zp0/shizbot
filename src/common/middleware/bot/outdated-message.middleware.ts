import { NextFunction } from 'grammy';
import IBotMiddleware from '../../interfaces/bot-middleware.interface';
import { CustomContext } from '../../types/custom-context.type';
import { OUT_DATED_TIME_DIFF } from '../../constraints/timers.constraint';

export default class BotOutDatedMessageMiddleware implements IBotMiddleware {
    handler(ctx: CustomContext, next: NextFunction) {
        if (ctx.message) {
            if (new Date().getTime() / 1000 - ctx.message.date > OUT_DATED_TIME_DIFF) {
                ctx.isOutDatedMessage = true;
            }
        }
        return next();
    }
}
