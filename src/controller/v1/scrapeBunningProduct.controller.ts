import { Request, Response } from "express";
import { ApiError } from "../../interface/error.interface.js";
import { scrapeProducts } from "../../services/puppeteer.services.js";
import { ApiResponse } from "../../interface/response.interface.js";

// this api takes userId and search array and return the product details from web scraping the bunnings website
// type of request POST

// const request_body = {
//     userId: "string",
//     searchItems: [
//         {
//             searchTerm: "string",
//             productLimit: "number",
//             productPage: "number"
//         }
//     ],
//     productLimit: "number",
//     productPage: "number",
//     budgetValue: "number"
// }
export async function scrapeBunningsProduct(req: Request, res: Response) {
    try {
        const { userId, searchItems, minBudgetValue, maxBudgetValue, isBudgetSearchOn } = req.body;
        console.log("minBudgetValue, maxBudgetValue, isBudgetSearchOn", minBudgetValue, maxBudgetValue, isBudgetSearchOn)
        if (!userId || !searchItems) {
            const err = new ApiError(400, "userId, searchItems, minBudgetValue, maxBudgetValue, isBudgetSearchOn are required");
            res.json(err);
            return;
        }

        console.log(searchItems.length, searchItems, userId, "searchItems.length, searchItems, productLimit, productPage, userId")

        if (searchItems.length > 4) {
            const err = new ApiError(400, "Search Item Should Not Be More Than 4");
            res.json(err);
            return;
        }
        const scrapper = await scrapeProducts(searchItems, isBudgetSearchOn, maxBudgetValue, minBudgetValue);
        console.log(scrapper, "scrapper------------------------")
        if (scrapper.success) {
            const responseData = {
                userId: userId,
                searchItems: searchItems,
                data: scrapper.data
            }
            console.log("Product Details Fetched Successfully")
            const response = new ApiResponse(200, responseData, "Product Details Fetched Successfully");
            res.json(response)
            return;
        }
        else {
            console.log(scrapper.error, "scrapper.error")
            const err = new ApiError(500, scrapper.error);
            res.json(err);
            return;
        }

    } catch (error: any) {
        console.log(error.message, error.stack, "error.message, error.stack")
        const err = new ApiError(500, error.message, error.errors, error.stack);
        res.json(err);
        return;
    }

}