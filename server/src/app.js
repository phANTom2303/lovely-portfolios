import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet'; // Standard security headers
import { logger } from '#config/logger.js';
import { RESPONSE_CODES } from '#lib/common.js';
import { initRedis } from '#config/redis.js';
import { AppError } from '#lib/errors.js';
import linkRouter from '#routes/links.routes.js';
import educationRouter from '#routes/education.routes.js';
import skillsRouter from '#routes/skills.route.js';
import assetRouter from '#routes/assets.routes.js';
import authRouter from '#routes/auth.routes.js';
import { query } from '#config/db.js';
import { initDatabase } from '#config/initDB.js';

const app = express();
// Global Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: false }));

await initRedis();
if ((await query(`SELECT $1`, [1])).rowCount > 0) logger.info('DB Connected');
else logger.info('DB Not connected');
await initDatabase();


app.get('/', async (req, res) => {
    return res.json("Server Running :)")
});

// ── Route Mounts ────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/links', linkRouter);
app.use('/api/education', educationRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/assets', assetRouter);
// Global Error Handler
app.use((err, req, res, next) => {
    if (err instanceof AppError && err.isOperational) {
        logger.warn(`Operational Error [${err.status}]: ${err.message}`);

        return res.status(err.status).json({
            success: false,
            error: err.message
        });
    }

    logger.error(`Unanticipated ERROR: ${err.message}\nStack: ${err.stack}`);

    return res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR_CODE).json({
        success: false,
        error: "An unexpected internal server error occurred."
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    logger.info(`Server is running on Port ${PORT}`);
});
