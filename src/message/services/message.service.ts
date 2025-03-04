import { FindOptionsWhere, Repository } from 'typeorm';
import MessageEntity from '../entities/message.entity';
import ChatEntity from '../../chat/entities/chat.entity';
import { kyselyDb } from '../../common/db/kysely/config';

export default class MessageService {
    constructor(
        private readonly messageRepository: Repository<MessageEntity>,
    ) {}

    create(chat: ChatEntity, date: Date) {
        return this.messageRepository.save(
            this.messageRepository.create({
                chatId: chat.id,
                date: date.toISOString(),
                messagesCount: 0,
            }),
            { reload: true },
        );
    }

    getMessageByChat(chat: ChatEntity, date?: Date) {
        const where: FindOptionsWhere<MessageEntity> = { chatId: chat.id };
        if (date) {
            where.date = date.toISOString();
        }
        return this.messageRepository.findOne({ where });
    }

    async getTotalMessagesCountByChat(chat: ChatEntity) {
        const stmt = await this.messageRepository
            .createQueryBuilder('messages')
            .select(['messages.chat_id'])
            .addSelect('sum(messages.messagesCount) as amount')
            .where('messages.chat_id = :chatId', { chatId: chat.id })
            .groupBy('messages.chat_id')
            .getRawOne();

        if (!stmt) {
            return 0;
        }
        return stmt.amount;
    }

    async increaseMessageCounter(message: MessageEntity) {
        await this.messageRepository.update(
            { id: message.id },
            { messagesCount: message.messagesCount + 1 },
        );
    }

    async countMessagesByTgChat(
        tgChatId: number,
    ): Promise<{ firstName: string; username: string; amount: number }[]> {
        const stmt = await this.messageRepository
            .createQueryBuilder('messages')
            .select([
                'messages.chatId',
                'users.id',
                'users.tgUsername as username',
                'users.tgFirstName as "firstName"',
            ])
            .addSelect('sum(messages.messagesCount) as amount')
            .leftJoin('messages.chat', 'chats')
            .leftJoin('chats.user', 'users')
            .where('chats.chatId = :tgChatId', { tgChatId })
            .groupBy(
                'messages.chatId, users.id, users.tgUsername, users.tgFirstName',
            )
            .orderBy('amount', 'DESC', 'NULLS LAST')
            .getRawMany();
        return stmt.map((_row) => ({
            firstName: _row.firstName,
            username: _row.username,
            amount: _row.amount,
        }));
    }
}
