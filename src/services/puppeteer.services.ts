import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer-extra';
import { Page } from 'puppeteer';

puppeteer.use(StealthPlugin());

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

// Function to detect CAPTCHA presence
async function isCaptchaDetected(page: Page) {
    return await page.evaluate(() => {
        const captchaText = document.body.innerText;
        return captchaText.includes('Verify you are human') || 
               captchaText.includes('Please complete the CAPTCHA') || 
               document.querySelector('label.cb-lb') !== null;
    });
}

// Function to add delays and mouse movements for stealth
async function mimicHumanBehavior(page: Page) {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.floor(Math.random() * 3000))); // Random delay
    // await page.mouse.move(Math.random() * 500, Math.random() * 500);    // Random mouse move
}

export async function scrapeProducts(
    searchTerms: SearchItem[],
    isBudgetValuePresent: boolean,
    maxBudgetValue: number = -1,
    minBudgetValue: number = -1
): Promise<ScrapeResult> {

    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();
    // await page.setUserAgent(userAgent.toString()); // Set random user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (resourceType === 'font' || resourceType === 'stylesheet') {
            request.abort();
        } else {
            request.continue();
        }
    });

    const allResults: SearchResult[] = [];
    const maxRetries = 4;

    try {
        for (const term of searchTerms) {
            const encodedTerm = encodeURIComponent(term.searchTerm);
            const url = `https://www.bunnings.com.au/search/products?page=${term.productPage}&q=${encodedTerm}`;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Navigating to: ${url} (Attempt ${attempt})`);
                    await page.goto(url, { waitUntil: 'domcontentloaded' });

                    // Detect if CAPTCHA is present
                    if (await isCaptchaDetected(page)) {
                        console.log('CAPTCHA detected, refreshing page...');
                        await page.reload({ waitUntil: 'domcontentloaded' });
                        attempt--; // Retry the same attempt
                        continue;
                    }

                    // Wait for product tiles to load
                    await page.waitForSelector('.search-product-tile', { timeout: 20000 });
                    console.log(`Successfully loaded search results for "${term.searchTerm}"`);

                    const products: Product[] = await page.evaluate(() => {
                        const items = Array.from(document.querySelectorAll('.search-product-tile'));
                        return items.map(item => {
                            const priceText = (item.querySelector('.sc-bbcf7fe4-3') as HTMLElement)?.innerText || null;
                            const price = priceText ? parseFloat(priceText.replace(/[^0-9.-]+/g, "")) : null;
                            return {
                                name: (item.querySelector('.product-title') as HTMLElement)?.innerText || null,
                                price,
                                imageUrl: (item.querySelector('img.search-product-image') as HTMLImageElement)?.src || null,
                                link: item.querySelector('a')?.href || null,
                                reviews: (item.querySelector('.span-review-container') as HTMLElement)?.innerText || null,
                            };
                        });
                    });

                    const productFiltered = products.filter(product =>
                        product.name !== null &&
                        product.price !== null &&
                        product.imageUrl !== null &&
                        product.link !== null &&
                        product.reviews !== null
                    );

                    const filteredProducts = isBudgetValuePresent
                        ? productFiltered.filter(product =>
                            product.price !== null &&
                            product.price >= minBudgetValue &&
                            product.price <= maxBudgetValue
                        )
                        : productFiltered;

                    const limitedProducts = filteredProducts.slice(0, term.productLimit);

                    allResults.push({
                        searchTerm: term.searchTerm,
                        data: limitedProducts,
                    });

                    console.log(`Found ${limitedProducts.length} valid products for "${term.searchTerm}".`);
                    break; // Exit retry loop on success

                } catch (error: any) {
                    console.error(`Attempt ${attempt} failed: ${error.message}`);
                    if (attempt === maxRetries) {
                        console.error('Max retries reached. Moving to next term.');
                        throw error;
                    }
                    await page.reload({ waitUntil: 'domcontentloaded' });
                    console.log('Page reloaded, retrying...');
                }
            }
        }

        return { success: true, data: allResults };

    } catch (error: any) {
        console.error('An error occurred:', error);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
}
