import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
dotenv.config();
const core = express();
const PORT = process.env.PORT || 3000;
const allowedOrigin = [
    process.env.CORS_ALLOWED_ORIGINS,
    process.env.CORS_ALLOWED_ORIGINS_2,
    process.env.CORS_ALLOWED_ORIGINS_3,
    process.env.CORS_ALLOWED_ORIGINS_4,
    process.env.CORS_ALLOWED_ORIGINS_5,
    'localhost:5000',
];
core.use(cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
core.use(express.urlencoded({ extended: true, limit: '16kb' }));
core.use(express.json({ limit: '16kb' }));
// routes
core.use('/api', app);
core.get('/', (req, res) => {
    res.send('Welcome to Web Scraper API');
});
// server listener
const server = http.createServer(core);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map