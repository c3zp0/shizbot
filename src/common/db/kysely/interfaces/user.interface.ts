import { Generated } from 'kysely';

export interface IUserTable {
    id: Generated<number>;
    tg_id: number;
    tg_first_name: string;
    tg_last_name: string;
    internal_alias: string;
    is_bot: boolean;
}
