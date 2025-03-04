import { Generated } from 'kysely';

export interface IUserChat {
    id: Generated<number>;
    chat_id: number;
    is_private: boolean;
    title: string;
    user_id: number;
}
