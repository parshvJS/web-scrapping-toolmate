import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// Set up plugins
puppeteer.use(StealthPlugin());
export async function scrapeProducts(searchTerms, isBudgetValuePresent, maxBudgetValue = -1, minBudgetValue = -1) {
    const browser = await puppeteer.launch({
        headless: false
    });
    // const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Set random user agent for stealth
    // const userAgent = new UserAgent();
    // await page.setUserAgent(userAgent.toString());
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
    await page.setViewport({ width: 1366, height: 768 });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (resourceType === 'font' || resourceType === 'stylesheet') {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    const allResults = [];
    const maxRetries = 4;
    try {
        for (const term of searchTerms) {
            const encodedTerm = encodeURIComponent(term.searchTerm);
            const url = `https://www.bunnings.com.au/search/products?page=${term.productPage}&q=${encodedTerm}`;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Navigating to: ${url} (Attempt ${attempt})`);
                    await page.goto(url, { waitUntil: 'domcontentloaded' });
                    // Wait for product tiles to load
                    await page.waitForSelector('.search-product-tile', { timeout: 20000 });
                    console.log(`Successfully loaded search results for "${term.searchTerm}"`);
                    const products = await page.evaluate(() => {
                        const items = Array.from(document.querySelectorAll('.search-product-tile'));
                        return items.map(item => {
                            const priceText = item.querySelector('.sc-bbcf7fe4-3')?.innerText || null;
                            const price = priceText ? parseFloat(priceText.replace(/[^0-9.-]+/g, "")) : null;
                            return {
                                name: item.querySelector('.product-title')?.innerText || null,
                                price,
                                imageUrl: item.querySelector('img.search-product-image')?.src || null,
                                link: item.querySelector('a')?.href || null,
                                reviews: item.querySelector('.span-review-container')?.innerText || null,
                            };
                        });
                    });
                    const productFiltered = products.filter(product => product.name !== null &&
                        product.price !== null &&
                        product.imageUrl !== null &&
                        product.link !== null &&
                        product.reviews !== null);
                    const filteredProducts = isBudgetValuePresent
                        ? productFiltered.filter(product => product.price !== null &&
                            product.price >= minBudgetValue &&
                            product.price <= maxBudgetValue)
                        : productFiltered;
                    const limitedProducts = filteredProducts.slice(0, term.productLimit);
                    allResults.push({
                        searchTerm: term.searchTerm,
                        data: limitedProducts,
                    });
                    console.log(`Found ${limitedProducts.length} valid products for "${term.searchTerm}".`);
                    break; // Exit retry loop on success
                }
                catch (error) {
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
    }
    catch (error) {
        console.error('An error occurred:', error);
        return { success: false, error: error.message };
    }
    finally {
        await browser.close();
        console.log('Browser closed');
    }
}
//# sourceMappingURL=puppeteer.services.js.map