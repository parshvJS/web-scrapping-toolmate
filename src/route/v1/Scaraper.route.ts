import { Router } from "express";
import { scrapeBunningsProduct } from "../../controller/v1/scrapeBunningProduct.controller.js";

const scraperRoute = Router();

scraperRoute.route('/scrapeBunningsProduct').post(scrapeBunningsProduct)

export default scraperRoute