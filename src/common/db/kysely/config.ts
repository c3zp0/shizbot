import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { envUtil } from '../../utils/env.util';
import { Database } from './interfaces/db.interface';

const dialect = new PostgresDialect({
    pool: new Pool({
        host: envUtil.extractString('DB_HOST'),
        port: envUtil.extractInt('DB_PORT'),
        database: envUtil.extractString('DB_NAME'),
        user: envUtil.extractString('DB_USER'),
        password: envUtil.extractString('DB_PASSWORD'),
        max: 2,
        log(...messages) {
            console.log(messages);
        },
    }),
});

export const kyselyDb = new Kysely<Database>({ dialect });
