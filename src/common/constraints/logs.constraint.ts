import { UserEntity } from '../../user/entities/user.entity';
import { logMessageGenerator } from '../utils/log.utl';

export const MESSAGE_IS_OUTDATED_LOG = (
    place: string,
    messageId: number,
): string =>
    logMessageGenerator('message', place, 'is outdated', messageId.toString());

export const NO_CHAT_IN_CONTEXT = (place: string, messageId: number) =>
    logMessageGenerator('chat', place, 'is undefined', messageId.toString());

export const NO_CHAT_IN_USER_CHATS = (place: string, user: UserEntity) =>
    logMessageGenerator(
        'user.chats',
        place,
        'user chat not found',
        `${user.id}-${user.tgUsername}`,
    );

export const NO_MESSAGE_IN_CONTEXT = (place: string) =>
    logMessageGenerator('message', place, 'is undefined');
