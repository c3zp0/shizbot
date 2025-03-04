import { RedisClientType } from 'redis';
import {
    CACHE_EXPIRATION_SECONDS,
    PAGE_SIZE,
} from '../constraints/wiki.constraint';
import { IWikiSearchResponse } from '../interfaces/wiki-response.interface';
import { IWikiService } from '../interfaces/wiki-service.interface';
import { IWikiCache } from '../interfaces/wiki-cache.interface';

export class WikiService implements IWikiService {
    constructor(protected redisClient: RedisClientType) {}
    wikiBase = 'https://ru.wikipedia.org/w/api.php';

    async search(searchString: string, page: number) {
        const url = new URL('', this.wikiBase);
        url.searchParams.append('action', 'query');
        url.searchParams.append('list', 'search');
        url.searchParams.append('format', 'json');
        url.searchParams.append('srlimit', PAGE_SIZE.toString());
        url.searchParams.append(
            'sroffset',
            ((page - 1) * PAGE_SIZE).toString(),
        );
        url.searchParams.append('srsearch', searchString);
        const isRequestCached = await this.redisClient.get(url.toString());
        if (isRequestCached) {
            const data = JSON.parse(isRequestCached) as IWikiCache;
            if (new Date(data.exp).getTime() > new Date().getTime()) {
                return data.cache as IWikiSearchResponse;
            }
        }
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (!data) {
                throw new Error('Search not successful');
            }
            await this.redisClient.set(
                url.toString(),
                JSON.stringify({
                    exp: new Date().getTime() + CACHE_EXPIRATION_SECONDS * 1000,
                    cache: data,
                }),
            );
            return data as IWikiSearchResponse;
        }
        throw new Error(
            `Wiki request error ${response.status} ${response.text}`,
        );
    }

    async getPage(pageId: number) {
        const url = new URL('', this.wikiBase);
        url.searchParams.append('action', 'query');
        url.searchParams.append('prop', 'extracts');
        url.searchParams.append('format', 'json');
        url.searchParams.append('exintro', 'true');
        url.searchParams.append('explaintext', 'true');
        url.searchParams.append('pageids', pageId.toString());

        const isRequestCached = await this.redisClient.get(url.toString());
        if (isRequestCached) {
            const data = JSON.parse(isRequestCached) as IWikiCache;
            if (new Date(data.exp).getTime() > new Date().getTime()) {
                return data.cache;
            }
        }

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (!data) {
                throw new Error('Search not successful');
            }
            await this.redisClient.set(
                url.toString(),
                JSON.stringify({
                    exp: new Date().getTime() + CACHE_EXPIRATION_SECONDS * 1000,
                    cache: data,
                }),
            );
            return data;
        }
        throw new Error(`Wiki page request error ${response.status}`);
    }
}
