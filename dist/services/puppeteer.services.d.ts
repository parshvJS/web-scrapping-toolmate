interface Product {
    name: string | null;
    price: number | null;
    imageUrl: string | null;
    link: string | null;
    reviews: string | null;
}
interface SearchResult {
    searchTerm: string;
    data: Product[];
}
interface ScrapeResult {
    success: boolean;
    data?: SearchResult[];
    error?: string;
}
interface SearchItem {
    searchTerm: string;
    productLimit: number;
    productPage: number;
}
export declare function scrapeProducts(searchTerms: SearchItem[], isBudgetValuePresent: boolean, maxBudgetValue?: number, minBudgetValue?: number): Promise<ScrapeResult>;
export {};
