import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepo from '#repositories/user.repo.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '#lib/errors.js';
import { getRedisClient } from '#config/redis.js';
import { logger } from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lovely_portfolios_jwt_super_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token with a unique jti identifier
 */
const generateToken = (payload) => {
    return jwt.sign(
        { ...payload, jti: crypto.randomUUID() },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Register a new user
 */
export const signup = async ({ name, email, password, phone_no }) => {
    if (!name || !email || !password) {
        throw new BadRequestError('Name, email, and password are required');
    }

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepo.createUser({
        name,
        email,
        password: hashedPassword,
        phone_no: phone_no || null,
    });

    const token = generateToken({ id: newUser.id, email: newUser.email });

    return {
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone_no: newUser.phone_no,
        },
        token,
    };
};

/**
 * Authenticate user credentials and return a token
 */
export const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new BadRequestError('Email and password are required');
    }

    const user = await userRepo.findByEmail(email);
    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_no: user.phone_no,
        },
        token,
    };
};

/**
 * Invalidate/blacklist a token in Redis until expiration
 */
export const logout = async ({ token }) => {
    if (!token) return true;

    try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            const remainingTTL = decoded.exp - currentTime;

            if (remainingTTL > 0) {
                const redisClient = getRedisClient();
                await redisClient.setEx(`blacklist:${token}`, remainingTTL, 'blacklisted');
                logger.info(`Token blacklisted in Redis for ${remainingTTL} seconds`);
            }
        }
    } catch (err) {
        logger.warn(`Redis token blacklist warning: ${err.message}`);
    }

    return true;
};
