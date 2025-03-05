import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { VoiceEntity } from '../../voice/entities/user-voice.entity';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'tg_id' })
    tgId: number;

    @Column({ name: 'tg_first_name' })
    tgFirstName: string;

    @Column({ name: 'tg_username' })
    tgUsername: string;

    @Column({ name: 'internal_alias' })
    internalAlias: string;

    @Column({ name: 'is_bot' })
    isBot: boolean;

    @OneToMany(() => VoiceEntity, (_: VoiceEntity) => _.user)
    voices: VoiceEntity[];

    @OneToMany(() => ChatEntity, (_: ChatEntity) => _.user)
    chats: ChatEntity[];
}
