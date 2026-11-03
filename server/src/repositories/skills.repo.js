import { query } from "#src/config/db.js";

/**
 * Fetch all skills (admin / debug use).
 */
export const findAll = async () => {
    const sql = `SELECT * FROM skills`;
    const { rows } = await query(sql);
    return rows;
};

/**
 * Fetch profile-level skills for a user (re_id IS NULL).
 */
export const getProfileSkills = async (user_id) => {
    const sql = `
        SELECT * FROM skills
        WHERE user_id = $1 AND re_id IS NULL
    `;
    const { rows } = await query(sql, [user_id]);
    return rows;
};

/**
 * Fetch skills tied to a specific resume entity.
 */
export const getResumeEntitySkills = async (user_id, re_id) => {
    const sql = `
        SELECT * FROM skills
        WHERE user_id = $1 AND re_id = $2
    `;
    const { rows } = await query(sql, [user_id, re_id]);
    return rows;
};

/**
 * Insert a new skill.
 * Pass re_id = null for a profile-level skill.
 */
export const createSkill = async (user_id, skill_name, re_id = null) => {
    const sql = `
        INSERT INTO skills (skill_name, user_id, re_id)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const { rows } = await query(sql, [skill_name, user_id, re_id]);
    return rows[0];
};

/**
 * Delete a skill by its id, scoped to the owning user.
 */
export const remove = async (user_id, skill_id) => {
    const sql = `
        DELETE FROM skills
        WHERE skill_id = $1 AND user_id = $2
        RETURNING *
    `;
    const { rows } = await query(sql, [skill_id, user_id]);
    return rows[0];
};

/**
 * Update a skill's name, scoped to the owning user.
 */
export const update = async (user_id, skill_id, skill_name) => {
    const sql = `
        UPDATE skills
        SET skill_name = $1
        WHERE skill_id = $2 AND user_id = $3
        RETURNING *
    `;
    const { rows } = await query(sql, [skill_name, skill_id, user_id]);
    return rows[0] ?? null;
};
