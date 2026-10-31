import { query } from '#config/db.js';

export const findByEmail = async (email) => {
    const sql = `
        SELECT id, name, email, password, phone_no, gender, profile_photo_link, professional_title, about, current_location
        FROM users
        WHERE email = $1
    `;
    const { rows } = await query(sql, [email.toLowerCase().trim()]);
    return rows[0] ?? null;
};

export const findById = async (id) => {
    const sql = `
        SELECT id, name, email, phone_no, gender, profile_photo_link, skills, professional_title, about, current_location
        FROM users
        WHERE id = $1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] ?? null;
};

export const createUser = async ({ name, email, password, phone_no = null }) => {
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
    return rows[0];
};
