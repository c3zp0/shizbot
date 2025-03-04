import { InlineKeyboard } from 'grammy';
import { IWikiService } from '../interfaces/wiki-service.interface';
import { PAGE_SIZE } from '../constraints/wiki.constraint';
import { IWikiArticleResponse } from '../interfaces/wiki-article-response.interface';

export class WikiController {
    constructor(private wikiService: IWikiService) {}

    async search(searchString: string, page: number): Promise<InlineKeyboard> {
        const data = await this.wikiService.search(searchString, page);
        const keyboard = new InlineKeyboard();
        for (let i = 0; i < data.query.search.length; i++) {
            if (i % 2 === 0) {
                keyboard.row();
            }
            keyboard.text(
                data.query.search[i].title,
                `wiki_${data.query.search[i].pageid}`,
            );
        }
        keyboard.row();
        const lastPage = Math.ceil(data.query.searchinfo.totalhits / PAGE_SIZE);
        if (page > 1) {
            keyboard.text('Prev', `page_${page - 1}_${searchString}`);
        }
        keyboard.text(`${page}/${lastPage}`, 'current_and_last_pages');
        if (page < lastPage) {
            keyboard.text('Next', `page_${page + 1}_${searchString}`);
        }
        return keyboard;
    }

    getArticle(pageId: number): Promise<IWikiArticleResponse> {
        return this.wikiService.getPage(pageId);
    }
}
