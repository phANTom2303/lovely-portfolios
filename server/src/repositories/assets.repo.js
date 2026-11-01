import { query } from "#src/config/db.js";
import { getRedisClient } from "#src/config/redis.js";

const CACHE_TTL = 3600;

export const findAll = async () => {
    const redisClient = getRedisClient();
    const cacheKey = 'assets:all';

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const sql = ' SELECT * FROM assets';
    const { rows } = await query(sql);

    if (rows.length > 0) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(rows));
    }
    return rows;
};
export const getResumeEntityAssets = async (user_id, re_id) => {
    const redisClient = getRedisClient();
    const cacheKey = `user:${user_id}:re:${re_id}:assets`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const sql = `
       SELECT * FROM Assets 
        WHERE user_id = $1 AND re_id=$2   `;
    const { rows } = await query(sql, [user_id, re_id]);

    if (rows.length > 0) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(rows));
    }
    return rows;
}


export const create = async (user_id, re_id, title, link, description = null, asset_type) => {
    const sql = `INSERT INTO assets (user_id,re_id,title, link, description,asset_type)
  VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const { rows } = await query(sql, [user_id, re_id, title, link, description, asset_type]);

    const redisClient = getRedisClient();
    await redisClient.del(`user:${user_id}:re:${re_id}:assets`);
    await redisClient.del('assets:all');

    return rows[0];
};

export const createImage = async (user_id, re_id,  title, description = null, asset_type = 'image', cloudinary_public_id, link) => {

    const sql = `INSERT INTO assets(user_id, re_id, title, link, cloudinary_public_id, asset_type, description)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;

    const { rows } = await query(sql, [user_id, re_id, title, link, cloudinary_public_id, asset_type, description]);
    
    const redisClient = getRedisClient();
    await redisClient.del(`user:${user_id}:re:${re_id}:assets`);
    await redisClient.del('assets:all');

    return rows[0];
}

export const remove = async (id) => {
    const sql = `
    DELETE FROM assets
    WHERE asset_id=$1
    RETURNING *
    `;

    const { rows } = await query(sql, [id]);
    const deletedRow = rows[0];

    if (deletedRow) {
        const redisClient = getRedisClient();
        await redisClient.del(`user:${deletedRow.user_id}:re:${deletedRow.re_id}:assets`);
        await redisClient.del('assets:all');
    }

    return deletedRow;
};

export const update = async (user_id, id, fields) => {
    const allowedKeys = ['title', 'link', 'description', 'asset_type'];
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
    values.push(id);
    values.push(user_id);
    const sql = `UPDATE assets SET ${setClauses.join(', ')}
  where asset_id = $${paramIndex} AND user_id=$${paramIndex + 1}
  RETURNING *`;


    const { rows } = await query(sql, values);
    const updatedRow = rows[0];

    if (updatedRow) {
        const redisClient = getRedisClient();
        await redisClient.del(`user:${updatedRow.user_id}:re:${updatedRow.re_id}:assets`);
        await redisClient.del('assets:all');
    }

    return updatedRow ?? null;
};
