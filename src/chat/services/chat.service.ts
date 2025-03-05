import { Repository } from 'typeorm';
import { ChatEntity } from '../entities/chat.entity';
import { UserEntity } from '../../user/entities/user.entity';

export class ChatService {
    constructor(private readonly chatRepository: Repository<ChatEntity>) {}

    create(
        chatId: number,
        title: string | undefined,
        isPrivate: boolean,
        user: UserEntity,
    ): Promise<ChatEntity> {
        return this.chatRepository.save(
            this.chatRepository.create({
                chatId,
                title,
                isPrivate,
                userId: user.id,
            }),
            {
                reload: true,
            },
        );
    }

    getChatByTelegramId(chatId: ChatEntity['chatId']) {
        return this.chatRepository.findOne({ where: { chatId } });
    }
}
