import { Bot, session } from 'grammy';
import UserMiddleware from '../middleware/bot/user.middleware';
import { CustomContext, Session } from '../types/custom-context.type';
import BotOutDatedMessageMiddleware from '../middleware/bot/outdated-message.middleware';
import BotMessageProcessMiddleware from '../middleware/bot/message-process.middleware';
import { voiceComposer } from '../../voice/composer/voice.composer';
import { messagesComposer } from '../../message/composer/message.composer';
import { userComposer } from '../../user/transporters/user-tg-composer.transport';
import { randomComposer } from '../../random/random.composer';
import { wikiComposer } from '../../wiki/composers/wiki.composer';

export default class BotHandlersBinder {
    constructor(private readonly _bot: Bot<CustomContext>) {}

    async bind() {
        this._bot.use(
            session({
                initial: (): Session => ({
                    jobInProgress: null,
                    jobStage: null,
                    userId: 0,
                    stageRetry: 1,
                    clear: (ctx: CustomContext) => {
                        ctx.session.jobInProgress = null;
                        ctx.session.jobStage = null;
                        delete ctx.session.randomStart;
                        ctx.session.stageRetry = 1;
                    },
                }),
            }),
        );

        const userMiddleware = new UserMiddleware();
        const outDatedMessagesMiddleware = new BotOutDatedMessageMiddleware();
        const messageMiddleware = new BotMessageProcessMiddleware();

        this._bot.use(userMiddleware.handler.bind(userMiddleware));
        this._bot.use(
            outDatedMessagesMiddleware.handler.bind(outDatedMessagesMiddleware),
        );
        this._bot.use(messageMiddleware.handler.bind(messageMiddleware));

        this._bot.use(voiceComposer);
        this._bot.use(messagesComposer);
        this._bot.use(userComposer);
        this._bot.use(randomComposer);
        this._bot.use(wikiComposer);
        this._bot.catch(console.log);
    }
}
