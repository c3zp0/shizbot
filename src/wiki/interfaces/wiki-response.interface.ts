export interface IWikiSearchResponse {
    continue: {
        sroffset: number;
    };
    query: {
        searchinfo: {
            totalhits: number;
        };
        search: {
            title: string;
            pageid: number;
            size: number;
            workcount: number;
            snippet: string;
        }[];
    };
}
