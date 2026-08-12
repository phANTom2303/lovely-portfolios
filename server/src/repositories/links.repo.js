import { query } from "#src/config/db.js";

export const findAll = async () => {
    const sql = `SELECT * FROM links`;
    const { rows } = await query(sql);
    return rows;
};