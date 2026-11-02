import { query } from "#src/config/db.js";
import { getRedisClient } from "#src/config/redis.js";

const CACHE_TTL = 3600;

export const getAllPortfolios = async (user_id) => {
    const redisClient = getRedisClient();
    const cacheKey = `user:${user_id}:portfolios`;

    // Check Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    // Run sql query if not found in cache
    const sql = `
    SELECT *
    FROM portfolio
    WHERE user_id = $1
    `;
    const { rows } = await query(sql, [user_id]);

    // Save DB result to Redis
    if (rows.length > 0) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(rows));
    }

    return rows;
};

export const getPortfolioById = async (portfolio_id) => {
    const redisClient = getRedisClient();
    const cacheKey = `portfolio:${portfolio_id}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const sql = `
    SELECT *
    FROM portfolio
    WHERE portfolio_id = $1
    `;
    const { rows } = await query(sql, [portfolio_id]);
    const result = rows[0] ?? null;

    if (result) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    }

    return result;
};

export const makePortfolio = async (user_id, user_email, portfolio_name, portfolio_date) => {
    const sql = `
    INSERT INTO portfolio (user_id, user_email, portfolio_name, portfolio_date, create_date)
    VALUES ($1, $2, $3, $4, CURRENT_DATE)
    RETURNING *
    `;
    const { rows } = await query(sql, [user_id, user_email, portfolio_name, portfolio_date ?? null]);

    const redisClient = getRedisClient();
    await redisClient.del(`user:${user_id}:portfolios`);

    return rows[0];
};

export const removePortfolio = async (user_id, portfolio_id) => {
    const sql = `
    DELETE FROM portfolio
    WHERE user_id = $1
    AND portfolio_id = $2
    RETURNING *
    `;
    const { rows } = await query(sql, [user_id, portfolio_id]);

    const redisClient = getRedisClient();
    await redisClient.del(`user:${user_id}:portfolios`);
    await redisClient.del(`portfolio:${portfolio_id}`);

    return rows[0] ?? null;
};

export const update = async (user_id, portfolio_id, fields) => {
    const fieldMap = {
        portfolio_name: "portfolio_name",
        portfolio_date: "portfolio_date",
        user_email: "user_email",
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, column] of Object.entries(fieldMap)) {
        if (fields[key] !== undefined) {
            setClauses.push(`${column} = $${paramIndex}`);
            values.push(fields[key]);
            paramIndex++;
        }
    }

    values.push(user_id);
    values.push(portfolio_id);

    const sql = `
    UPDATE portfolio
    SET ${setClauses.join(",")}
    WHERE user_id = $${paramIndex}
    AND portfolio_id = $${paramIndex + 1}
    RETURNING *
    `;

    const { rows } = await query(sql, values);

    const redisClient = getRedisClient();
    await redisClient.del(`user:${user_id}:portfolios`);
    await redisClient.del(`portfolio:${portfolio_id}`);

    return rows[0] ?? null;
};
