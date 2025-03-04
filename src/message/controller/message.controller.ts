import ChatService from '../../chat/services/chat.service';
import { CustomContext } from '../../common/types/custom-context.type';
import { MonthMapRu } from '../../common/utils/datetime.util';
import PhraseService from '../../phrase/phrase.service';
import MessageService from '../services/message.service';

export class MessageController {
    constructor(
        private readonly _messageService: MessageService,
        private readonly _chatService: ChatService,
        private readonly _phraseService: PhraseService,
    ) {}

    private isContextNeeded(message: string): boolean {
        return !/шиз/gi.test(message);
    }

    async getMessageAmountByYear(userId: number, chatId: number) {
        const today = new Date();
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const start = new Date(
            today.getFullYear() - 1,
            today.getMonth() + 1,
            1,
        );
        const raw = await this._messageService.countMessagesByYear(
            userId,
            chatId,
            start,
            end,
        );
        return raw.map((_row) => {
            const date = new Date(_row.tf);
            return {
                ..._row,
                messagesCount: _row.amount || 0,
                month: MonthMapRu[
                    (date.getMonth() + 1).toString() as keyof typeof MonthMapRu
                ],
                year: date.getFullYear(),
            };
        });
    }

    private getContext(message: string): string {
        const words = this._phraseService.extractWords(message);
        const initialWordIndex = Math.floor(Math.random() * (words.length - 1));
        let context = words[initialWordIndex];
        if (words.length > 1) {
            if (initialWordIndex === words.length - 1) {
                context = `${words[initialWordIndex - 1]} ${context}`;
            } else {
                context += ` ${words[initialWordIndex + 1]}`;
            }
        }
        return context;
    }

    async generateRandomSentence(ctx: CustomContext) {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat || !ctx.message.text) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const phrase = await (this.isContextNeeded(ctx.message.text)
            ? this._phraseService.generateSentence(
                  this.getContext(ctx.message.text),
              )
            : this._phraseService.getRandomSentence());

        if (!phrase) {
            throw new Error('Не удалось сгенерировать фразу');
        }

        await ctx.reply(phrase, {
            reply_parameters: { message_id: ctx.message.message_id },
        });
    }

    async countChatUsersMessages(ctx: CustomContext) {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const top = await this._messageService.countMessagesByTgChat(
            ctx.chat.id,
        );
        const message = `Топ спамеров:\n`;
        await ctx.api.sendMessage(
            ctx.chat.id,
            top.reduce((acc, curr) => {
                if (!curr) {
                    return acc;
                }
                return `${acc}<a href="t.me/${curr.username}">${curr.firstName}</a> - ${curr.amount || 0} сообщений\n`;
            }, message),
            { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
        );
    }

    async countOwnMessages(ctx: CustomContext) {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        let chat = ctx.user.chats.find(
            (_chat) => _chat.chatId === ctx.chat?.id,
        );
        if (!chat) {
            const isChatExists = await this._chatService.getChatByTelegramId(
                ctx.chat.id,
            );
            if (!isChatExists) {
                throw new Error(`Chat doesn't exists`);
            }
            chat = isChatExists;
        }
        let messagesToday = await this._messageService.getMessageByChat(
            chat,
            new Date(),
        );
        if (!messagesToday) {
            messagesToday = await this._messageService.create(chat, new Date());
        }
        const totalMessages =
            await this._messageService.getTotalMessagesCountByChat(chat);
        const response = `Общее количество сообщений: ${totalMessages}\nСообщений за сегодня: ${messagesToday.messagesCount}`;
        await ctx.reply(response, {
            reply_parameters: { message_id: ctx.message?.message_id },
        });
    }
}
