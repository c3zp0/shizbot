import { FindOptionsWhere, Repository } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { kyselyDb } from '../../common/db/kysely/config';
import { sql } from 'kysely';

export class MessageService {
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

    async countMessagesByYear(
        userId: number,
        chatId: number,
        startDate: Date,
        endDate: Date,
    ) {
        const rows = await kyselyDb
            .selectFrom((eb) =>
                eb
                    .selectFrom('users_chats')
                    .where('chat_id', '=', chatId)
                    .where('user_id', '=', userId)
                    .select(
                        sql<string>`generate_series(${startDate.toISOString()}, ${endDate.toISOString()}, interval '1month')`.as(
                            'tf',
                        ),
                    )
                    .as('tf_sq'),
            )
            .leftJoinLateral(
                (eb) =>
                    eb
                        .selectFrom('chats_messages as cm')
                        .leftJoin('users_chats as uc', 'uc.id', 'cm.chat_id')
                        .select((_eb) => [
                            _eb.fn.sum('cm.messages_count').as('amount'),
                        ])
                        .where('uc.chat_id', '=', chatId)
                        .where('uc.user_id', '=', userId)
                        .whereRef('cm.date', '>=', 'tf_sq.tf')
                        .whereRef(
                            'cm.date',
                            '<=',
                            sql`tf_sq.tf + interval '1month'`,
                        )
                        .as('ls'),
                (join) => join.onTrue(),
            )
            .select(['ls.amount', 'tf_sq.tf'])
            .execute();
        if (!rows) {
            throw new Error('Empty array');
        }
        return rows;
        // select tf_sq.time_frame, ls.*
        // from (
        //     select generate_series('2024-03-01', '2025-03-30', interval '1month') as time_frame
        // ) as tf_sq
        // left join lateral (
        //         select sum(cm.messages_count) as amount
        //         from chats_messages cm
        //         left join users_chats uc on uc.id = cm.chat_id
        //         where uc.chat_id = '-4633645534' and cm.date
        //             between tf_sq.time_frame
        //             and tf_sq.time_frame + interval '1month'
        // ) as ls on true
    }
}
