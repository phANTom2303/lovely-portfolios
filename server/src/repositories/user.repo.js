import { query } from '#config/db.js';
import { getRedisClient } from "#src/config/redis.js";

const CACHE_TTL = 3600;

export const findByEmail = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const redisClient = getRedisClient();

    const cacheKey = `user:email:${normalizedEmail}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const sql = `
        SELECT id, name, email, password, phone_no, gender, profile_photo_link, professional_title, about, current_location
        FROM users
        WHERE email = $1
    `;
    const { rows } = await query(sql, [email.toLowerCase().trim()]);
    const user = rows[0] ?? null;

    if (user) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));
    }

    return user;
};

export const findById = async (id) => {
    const redisClient = getRedisClient();

    const cacheKey = `user:${id}:profile`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const sql = `
        SELECT id, name, email, phone_no, gender, profile_photo_link, skills, professional_title, about, current_location
        FROM users
        WHERE id = $1
    `;
    const { rows } = await query(sql, [id]);
    const user = rows[0] ?? null;

    if (user) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));
    }

    return user;
};

export const createUser = async ({ name, email, password, phone_no = null }) => {
    const normalizedEmail = email.toLowerCase().trim();

    const sql = `
        INSERT INTO users (name, email, password, phone_no)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, phone_no, gender, profile_photo_link, professional_title, about, current_location
    `;
    const { rows } = await query(sql, [
        name.trim(),
        email.toLowerCase().trim(),
        password,
        phone_no,
    ]);
    const newUser = rows[0];

    if (newUser) {
        const redisClient = getRedisClient();
        await redisClient.setEx(`user:email:${normalizedEmail}`, CACHE_TTL, JSON.stringify(newUser));
        await redisClient.setEx(`user:${newUser.id}:profile`, CACHE_TTL, JSON.stringify(newUser));
    }

    return newUser;
};
