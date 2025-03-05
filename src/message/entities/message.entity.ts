import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatEntity } from '../../chat/entities/chat.entity';

@Entity({ name: 'chats_messages' })
export class MessageEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'chat_id' })
    chatId: number;

    @Column({ name: 'date' })
    date: string;

    @Column({ name: 'messages_count' })
    messagesCount: number;

    @ManyToOne(() => ChatEntity)
    @JoinColumn({ name: 'chat_id' })
    chat: ChatEntity;
}
