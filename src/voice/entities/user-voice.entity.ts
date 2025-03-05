import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { ChatEntity } from '../../chat/entities/chat.entity';

@Entity({ name: 'users_voices' })
export class VoiceEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'duration' })
    duration: number;

    @Column({ name: 'file_id' })
    fileId: string;

    @Column({ name: 'file_unique_id' })
    fileUniqueId: string;

    @Column({ name: 'file_size' })
    fileSize: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'chat_id' })
    chatId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => ChatEntity)
    @JoinColumn({ name: 'chat_id' })
    chat: ChatEntity;
}
