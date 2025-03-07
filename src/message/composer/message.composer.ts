import { Composer } from 'grammy';
import { CustomContext } from '../../common/types/custom-context.type';
import { BotCommandsEnum } from '../../common/enum/bot-commands.enum';
import { MessageController } from '../controller/message.controller';
import { ChatService } from '../../chat/services/chat.service';
import { dataSource } from '../../common/db/config';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { MessageService } from '../services/message.service';
import { MessageEntity } from '../entities/message.entity';
import { PhraseService } from '../../phrase/phrase.service';
import { Redis } from '../../common/db/redis/redis';
import { RedisConnectionEnum } from '../../common/enum/redis-connection.enum';

const messagesComposer = new Composer<CustomContext>();

const messageService = new MessageService(
    dataSource.getRepository(MessageEntity),
);
const chatService = new ChatService(dataSource.getRepository(ChatEntity));
const phraseService = new PhraseService(
    Redis.getRedisConnection(RedisConnectionEnum.SENTENCE_SEQUENCES),
);
const messageController = new MessageController(
    messageService,
    chatService,
    phraseService,
);

messagesComposer.command(
    BotCommandsEnum.MESSAGES_COUNTER,
    messageController.countOwnMessages.bind(messageController),
);
messagesComposer.command(
    BotCommandsEnum.TOP_MESSAGES_BY_CHAT,
    messageController.countChatUsersMessages.bind(messageController),
);

messagesComposer.hears(
    /шиз/gi,
    messageController.generateRandomSentence.bind(messageController),
);
messagesComposer.hears(/темка/gi, async (ctx: CustomContext) => {
    if (!ctx.message) {
        throw new Error('Invalid message');
    }
    await ctx.reply('Куда ты лезешь, оно тебя сожрет', {
        reply_parameters: { message_id: ctx.message.message_id },
    });
});

messagesComposer.command(
    BotCommandsEnum.MESSAGES_BY_YEAR,
    async (ctx: CustomContext) => {
        if (!ctx.chat) {
            throw new Error();
        }
        const data = await messageController.getMessageAmountByYear(
            ctx.user.id,
            ctx.chat?.id,
        );
        await ctx.reply(
            data.reduce((acc: string, row) => {
                const month = row.month.padEnd(30 - row.month.length, ' ');
                const year = row.year
                    .toString()
                    .padEnd(20 - row.year.toString().length, ' ');
                return `${acc}${month} ${year} ${row.messagesCount}\n`;
            }, 'Количество сообщение по месяцам за последний год:\n'),
            { parse_mode: 'HTML' },
        );
    },
);

export { messagesComposer };
