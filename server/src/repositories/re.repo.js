import { query } from "#src/config/db.js";

export const getAllREs = async (user_id, type) => {
    let sql = `SELECT * FROM resume_entity WHERE user_id = $1 AND status != 'deleted'`;
    const params = [user_id];

    if (type) {
        sql += ` AND re_type = $2`;
        params.push(type);
    }
    sql += ` ORDER BY from_date DESC`;

    const { rows } = await query(sql, params);
    return rows;
};

export const getREById = async (user_id, re_id) => {
    const sql = `
        SELECT * FROM resume_entity 
        WHERE user_id = $1 AND re_id = $2 AND status != 'deleted'
    `;
    const { rows } = await query(sql, [user_id, re_id]);
    return rows[0] ?? null;
};

export const createRE = async (user_id, fields) => {
    const sql = `
        INSERT INTO resume_entity (user_id, re_type, title, description, skills_id, from_date, to_date, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') 
        RETURNING *
    `;
    const values = [
        user_id, 
        fields.re_type, 
        fields.title, 
        fields.description, 
        fields.skills_id || [], 
        fields.from_date, 
        fields.to_date
    ];
    
    const { rows } = await query(sql, values);
    return rows[0];
};

export const removeRE = async (user_id, re_id) => {
    const sql = `
        UPDATE resume_entity SET status = 'deleted' 
        WHERE user_id = $1 AND re_id = $2 RETURNING *
    `;
    const { rows } = await query(sql, [user_id, re_id]);
    return rows[0] ?? null;
};

export const updateRE = async (user_id, re_id, fields) => {
    const fieldMap = {
        re_type: "re_type", title: "title", description: "description",
        skills_id: "skills_id", from_date: "from_date", to_date: "to_date", status: "status"
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

    if (setClauses.length === 0) return null;

    values.push(user_id, re_id);

    const sql = `
        UPDATE resume_entity SET ${setClauses.join(", ")}
        WHERE user_id = $${paramIndex} AND re_id = $${paramIndex + 1}
        RETURNING *
    `;

    const { rows } = await query(sql, values);
    return rows[0] ?? null;
};