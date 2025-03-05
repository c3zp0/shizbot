import { NextFunction } from 'grammy';
import { ChatEntity } from '../../../chat/entities/chat.entity';
import { ChatService } from '../../../chat/services/chat.service';
import { MessageEntity } from '../../../message/entities/message.entity';
import { MessageService } from '../../../message/services/message.service';
import { IBotMiddleware } from '../../interfaces/bot-middleware.interface';
import { CustomContext } from '../../types/custom-context.type';
import { PhraseService } from '../../../phrase/phrase.service';
import { Redis } from '../../db/redis/redis';
import { RedisConnectionEnum } from '../../enum/redis-connection.enum';
import { dataSource } from '../../db/config';

export class BotMessageProcessMiddleware implements IBotMiddleware {
    private messageService: MessageService;
    private chatService: ChatService;
    private readonly phraseMessage: PhraseService;

    constructor() {
        this.messageService = new MessageService(
            dataSource.getRepository(MessageEntity),
        );
        this.chatService = new ChatService(
            dataSource.getRepository(ChatEntity),
        );
        this.phraseMessage = new PhraseService(
            Redis.getRedisConnection(RedisConnectionEnum.SENTENCE_SEQUENCES),
        );
    }

    async handler(ctx: CustomContext, next: NextFunction) {
        if (!ctx.chat) {
            return;
        }
        let chat = ctx.user.chats.find(
            (_chat: ChatEntity) => _chat.chatId === ctx.chat?.id,
        );
        if (!chat) {
            const isChatExists = await this.chatService.getChatByTelegramId(
                ctx.chat.id,
            );
            if (!isChatExists) {
                return;
            }
            chat = isChatExists;
        }
        let message = await this.messageService.getMessageByChat(
            chat,
            new Date(),
        );
        if (!message) {
            message = await this.messageService.create(chat, new Date());
        }
        await this.messageService.increaseMessageCounter(message);
        if (ctx.message && ctx.message.text) {
            await this.phraseMessage.handleMessage(ctx.message.text);
        }
        await next();
    }
}
