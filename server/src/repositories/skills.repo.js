import { query } from "#src/config/db.js";

export const getAll = async () => {
    const sql = `SELECT * FROM skills`;
    const { rows } = await query(sql);
    return rows;
}

export const createSkill = async (skill_name) => {
    const sql = `INSERT INTO skills (skill_name)
        VALUES ($1)
        RETURNING *
    `

    const { rows } = await query(sql, [skill_name]);

    return rows;
}