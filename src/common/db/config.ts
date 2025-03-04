import dotenv from 'dotenv';
import path from 'path';
import { DataSource } from 'typeorm';
import envUtil from '../utils/env.util';
import UserEntity from '../../user/entities/user.entity';
import VoiceEntity from '../../voice/entities/user-voice.entity';
import ChatEntity from '../../chat/entities/chat.entity';
import MessageEntity from '../../message/entities/message.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config();

const options: PostgresConnectionOptions = {
    type: 'postgres',
    host: envUtil.extractString('DB_HOST'),
    port: envUtil.extractInt('DB_PORT'),
    database: envUtil.extractString('DB_NAME'),
    username: envUtil.extractString('DB_USER'),
    password: envUtil.extractString('DB_PASSWORD'),
    migrationsRun: true,
    migrationsTableName: 'migrations',
    migrations: [path.resolve(__dirname, 'migrations', '*.{ts,js}')],
    entities: [UserEntity, VoiceEntity, ChatEntity, MessageEntity],
    logging: false,
    synchronize: false,
};

export const dataSource = new DataSource(options);
