import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { VoiceEntity } from '../../voice/entities/user-voice.entity';
import { MessageEntity } from '../../message/entities/message.entity';

@Entity({ name: 'users_chats' })
export class ChatEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'chat_id' })
    chatId: number;

    @Column({ name: 'is_private' })
    isPrivate: boolean;

    @Column({ name: 'title' })
    title: string;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'messages_count' })
    messagesCount: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @OneToMany(() => VoiceEntity, (_: VoiceEntity) => _.chat)
    voices: VoiceEntity[];

    @OneToMany(() => MessageEntity, (_: MessageEntity) => _.chat)
    messages: MessageEntity[];
}
