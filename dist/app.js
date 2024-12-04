import express from 'express';
import scraperRoute from './route/v1/Scaraper.route.js';
const app = express();
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.json({ limit: '16kb' }));
// routes
app.use('/v1', scraperRoute);
export default app;
//# sourceMappingURL=app.js.map