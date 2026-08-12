import { query } from "#src/config/db.js";

export const findAll = async () => {
    const sql = `SELECT * FROM links`;
    const { rows } = await query(sql);
    return rows;
};

export const create = async (link, title, description = null) => {
    const sql = `
    INSERT INTO links (link, title, description)
    VALUES ($1, $2, $3) 
    RETURNING *
    `;

    const { rows } = await query(sql, [link, title, description]);

    return rows[0];
};