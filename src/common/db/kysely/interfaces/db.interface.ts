import { IChatMessage } from './chat-message.interface';
import { IUserChat } from './user-chat.interface';
import { IUserTable } from './user.interface';

export interface Database {
    users: IUserTable;
    chats_messages: IChatMessage;
    users_chats: IUserChat;
}
