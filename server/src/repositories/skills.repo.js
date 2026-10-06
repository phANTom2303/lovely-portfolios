import { query } from "#src/config/db.js";

export const getAll = async () => {
    const sql = `SELECT * FROM skills`;
    const { rows } = await query(sql);
    return rows;
}