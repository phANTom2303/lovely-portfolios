import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '#lib/errors.js';
import { getRedisClient } from '#config/redis.js';
import { logger } from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lovely_portfolios_jwt_super_secret_key';

/**
 * Middleware: userLoggedIn
 * Verifies JWT token from Authorization header and verifies it is not blacklisted in Redis.
 * Attaches decoded user payload to `req.user`.
 */
export const userLoggedIn = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            throw new UnauthorizedError('Access denied. No authentication token provided.');
        }

        // Check if token was blacklisted via logout
        try {
            const redisClient = getRedisClient();
            const isBlacklisted = await redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                throw new UnauthorizedError('Token is no longer valid. Please log in again.');
            }
        } catch (redisError) {
            if (redisError instanceof UnauthorizedError) {
                throw redisError;
            }
            logger.warn(`Redis check error in auth middleware: ${redisError.message}`);
        }

        // Verify JWT token signature and expiration
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            throw new UnauthorizedError('Invalid or expired authentication token.');
        }

        req.user = decoded;
        req.token = token;

        next();
    } catch (err) {
        next(err);
    }
};
