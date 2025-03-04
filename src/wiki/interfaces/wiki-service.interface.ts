import { IWikiArticleResponse } from './wiki-article-response.interface';
import { IWikiSearchResponse } from './wiki-response.interface';

export interface IWikiService {
    search(searchString: string, page: number): Promise<IWikiSearchResponse>;
    getPage(pageId: number): Promise<IWikiArticleResponse>;
}
