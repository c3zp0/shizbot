import { IWikiArticleResponse } from './wiki-article-response.interface';
import { IWikiSearchResponse } from './wiki-response.interface';

export interface IWikiCache {
    exp: string;
    cache: IWikiSearchResponse | IWikiArticleResponse;
}
