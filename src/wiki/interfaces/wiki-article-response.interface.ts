export interface IWikiArticleResponse {
    query: {
        pages: {
            [key: string]: {
                pageid: number;
                title: string;
                extract: string;
            };
        };
    };
}
