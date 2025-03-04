import { Generated } from 'kysely';

export interface IChatMessage {
    id: Generated<number>;
    chat_id: number;
    date: string;
    messages_count: number;
}
