import { Bot } from 'grammy';
import { BotCommandsEnum } from '../enum/bot-commands.enum';
import PhraseOnPhotoBotHandler from './photo/phrase-on-photo.handler';
import UserMiddleware from '../middleware/bot/user.middleware';
import { CustomContext } from '../types/custom-context.type';
import BotOutDatedMessageMiddleware from '../middleware/bot/outdated-message.middleware';
import BotMessageProcessMiddleware from '../middleware/bot/message-process.middleware';
import VoiceMessageBotHandler from './voice/voice-message.handler';
import TopVoicesCommandHandler from './voice/top-voices.handler';
import TodayTopVoicesCommandHandler from './voice/today-top-voices.handler';
import OwnVoicesLengthCommandHandler from './voice/own-voices-length.handler';
import OwnMessagesCountCommandHandler from './message/own-messages-count.handler';
import ChatTopMessagesCommandHandler from './message/chat-top-messages.handler';
import GenerateRandomSentenceBotHandler from './message/generate-random-sentence.handler';

export default class BotHandlersBinder {
    constructor(private readonly _bot: Bot<CustomContext>) {}

    async bind() {
        const userMiddleware = new UserMiddleware();
        const outDatedMessagesMiddleware = new BotOutDatedMessageMiddleware();
        const messageMiddleware = new BotMessageProcessMiddleware();

        this._bot.use(userMiddleware.middleware.bind(userMiddleware));
        this._bot.use(outDatedMessagesMiddleware.middleware.bind(outDatedMessagesMiddleware));
        this._bot.use(messageMiddleware.middleware.bind(messageMiddleware));

        this._bot.on([':voice', ':video_note'], async (ctx) => {
            await new VoiceMessageBotHandler().process(ctx);
        });

        this._bot.command(BotCommandsEnum.TOP_VOICES, async (ctx) => await new TopVoicesCommandHandler().process(ctx));
        this._bot.command(
            BotCommandsEnum.TOP_VOICES_TODAY,
            async (ctx) => await new TodayTopVoicesCommandHandler().process(ctx),
        );
        this._bot.command(
            BotCommandsEnum.OWN_VOICES_LENGTH,
            async (ctx) => await new OwnVoicesLengthCommandHandler().process(ctx),
        );
        this._bot.command(
            BotCommandsEnum.COUNT_MESSAGES,
            async (ctx) => await new OwnMessagesCountCommandHandler().process(ctx),
        );
        this._bot.command(
            BotCommandsEnum.TOP_MESSAGES,
            async (ctx) => await new ChatTopMessagesCommandHandler().process(ctx),
        );

        this._bot.hears(/шиз/gi, async (ctx) => await new GenerateRandomSentenceBotHandler().process(ctx));
        this._bot.hears(/темка/gi, async (ctx) => {
            if (!ctx.message) {
                throw new Error('Invalid message');
            }
            await ctx.reply('Куда ты лезешь, оно тебя сожрет', {
                reply_parameters: { message_id: ctx.message.message_id },
            });
        });

        this._bot.catch(console.log);
    }
}
