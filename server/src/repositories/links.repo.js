import { query } from "#src/config/db.js";

export const findAll = async () => {
    const sql = `SELECT * FROM links`;
    const { rows } = await query(sql);
    return rows;
};

export const getProfileLinks = async (user_id) => {
    const sql = `
       SELECT * FROM links
       WHERE user_id=$1 AND re_id IS NULL
    `;

    const { rows } = await query(sql, [user_id]);

    return rows;
};

export const getResumeEntityLinks = async (user_id, re_id) => {
    const sql = `
        SELECT * FROM links 
        WHERE user_id=$1 AND re_id=$2
    `;

    const { rows } = await query(sql, [user_id, re_id]);

    return rows;
}

export const createProfileLink = async (user_id, link, title, description = null) => {
    const sql = `
    INSERT INTO links (link, title, description, user_id)
    VALUES ($1, $2, $3, $4) 
    RETURNING *
    `;

    const { rows } = await query(sql, [link, title, description, user_id]);

    return rows[0];
};

export const createRElink = async (user_id, re_id, link, title, description = null) => {
    const sql = `
    INSERT INTO links (link, title, description, user_id, re_id)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
    `;

    const { rows } = await query(sql, [link, title, description, user_id, re_id]);

    return rows[0];
}
export const remove = async (id) => {
    const sql = `
    DELETE FROM links
    WHERE id=$1
    RETURNING *
    `;

    const { rows } = await query(sql, [id]);
    return rows[0];
};

export const update = async (user_id, link_id, fields) => {
    const allowedKeys = ['title', 'link', 'description'];
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

    values.push(link_id);
    values.push(user_id);

    const sql = `
    UPDATE links
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex} AND user_id=$${paramIndex + 1} 
    RETURNING *;
    `;

    const { rows } = await query(sql, values);
    return rows[0] ?? null;
};