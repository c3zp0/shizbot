import { RedisClientType, createClient } from 'redis';
import RedisConfig from './config';
import { RedisConnectionEnum } from '../../enum/redis-connection.enum';

export default class Redis {
    private static clients: Record<number, RedisClientType> = {};

    static getRedisConnection(type: RedisConnectionEnum) {
        if (!Redis.clients[type]) {
            Redis.clients[type] = createClient({
                url: new RedisConfig(type).configURL,
            });
        }
        Redis.clients[type].on('error', (error) =>
            console.log('Redis error\t', error),
        );
        return Redis.clients[type];
    }
}
