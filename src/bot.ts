import { Bot } from 'grammy';
import { envUtil } from './common/utils/env.util';
import { BotHandlersBinder } from './common/bot/handlers-binder';
import { BotCommandsEnum } from './common/enum/bot-commands.enum';
import { Redis } from './common/db/redis/redis';
import { CustomContext } from './common/types/custom-context.type';
import { RedisConnectionEnum } from './common/enum/redis-connection.enum';
import { dataSource } from './common/db/config';
import { BOT_COMMANDS } from './common/constraints/bot-commands.constraint';

const bot = new Bot<CustomContext>(envUtil.extractString('BOT_TOKEN'));

const redisCLient = Redis.getRedisConnection(
    RedisConnectionEnum.SENTENCE_SEQUENCES,
);
const mediaRedisClient = Redis.getRedisConnection(
    RedisConnectionEnum.MEDIA_GROUPS,
);
const wikiCacheRedis = Redis.getRedisConnection(RedisConnectionEnum.WIKI_CACHE);

dataSource
    .initialize()
    .then(() => redisCLient.connect())
    .then(() => redisCLient.ping())
    .then(() => mediaRedisClient.connect())
    .then(() => mediaRedisClient.ping())
    .then(() => wikiCacheRedis.connect())
    .then(() => wikiCacheRedis.ping())
    .then(() => bot.api.getMyCommands())
    .then((commands) => {
        if (
            !commands.length ||
            commands.length !== Object.keys(BotCommandsEnum).length
        ) {
            return bot.api.setMyCommands(BOT_COMMANDS);
        }
        return Promise.resolve(null);
    })
    .then(() => new BotHandlersBinder(bot).bind())
    .then(() => bot.start());
