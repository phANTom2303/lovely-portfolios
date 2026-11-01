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
        SELECT id, name, email, phone_no, gender, profile_photo_link, professional_title, about, current_location
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
        RETURNING id, name, email, password, phone_no, gender, profile_photo_link, professional_title, about, current_location
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

        if (newUser.password) delete newUser.password;
    }
    
    return newUser;
};

export const update = async (id, fields) => {
    const allowedKeys = [
        'name', 'phone_no', 'gender', 'profile_photo_link', 
        'professional_title', 'about', 'current_location', 'skills'
    ];
    
    let setClauses = [];
    let values = [];
    let paramIndex = 1;
    
    for (const key of allowedKeys) {
        if (fields[key] !== undefined) {
            setClauses.push(`${key}=$${paramIndex}`);
            values.push(fields[key]);
            paramIndex++;
        }
    }
    
    if (setClauses.length === 0) return null; 

    values.push(id);
    const sql = `
        UPDATE users 
        SET ${setClauses.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING id, name, email, phone_no, gender, profile_photo_link, skills, professional_title, about, current_location
    `;

    const { rows } = await query(sql, values);
    const updatedRow = rows[0];

    if (updatedRow) {
        const redisClient = getRedisClient();
        await redisClient.del(`user:${updatedRow.id}:profile`);
        if (updatedRow.email) {
            await redisClient.del(`user:email:${updatedRow.email}`);
        }
    }

    return updatedRow ?? null;
};


export const remove = async (id) => {
    const sql = `
        DELETE FROM users
        WHERE id = $1
        RETURNING *
    `;

    const { rows } = await query(sql, [id]);
    const deletedRow = rows[0];

    if (deletedRow) {
        const redisClient = getRedisClient();
        await redisClient.del(`user:${deletedRow.id}:profile`);
        if (deletedRow.email) {
            await redisClient.del(`user:email:${deletedRow.email}`);
        }
    }

    return deletedRow ?? null;
};


