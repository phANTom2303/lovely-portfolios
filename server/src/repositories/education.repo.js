import { query } from "#src/config/db.js";

export const getAllEducation = async(user_id) => {
    const sql = `
    SELECT * 
    FROM education
    WHERE user_id = $1
    `;
    const {rows} = await query(sql, [user_id]);
    return rows;
};

export const getEducationById = async(user_id, edu_id) => {
    const sql = `
    SELECT *
    FROM education
    WHERE user_id = $1
    AND education_id = $2
    `;
    const {rows} = await query(sql, [user_id, edu_id]);
    return rows[0] ?? null;
};

export const makeEducation = async (user_id,
    education_type,
    start_date,
    end_date,
    marks,
    marks_type,
    total_mark,
    institute_name,
    stream) => {
        const sql = `
        INSERT INTO education (
        user_id, education_type, from_date, to_date,
        marks, mark_type, total_mark, institute_name, stream) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `;
        const { rows } = await query(sql, [
        user_id,
        education_type,
        start_date,
        end_date,
        marks,
        marks_type,
        total_mark,
        institute_name,
        stream
        ]);
        return rows[0];
};

export const removeEducation = async (user_id, edu_id) => {
    const sql = `
        DELETE FROM education
        WHERE user_id = $1
        AND education_id = $2
        RETURNING *
    `;

    const { rows } = await query(sql, [user_id, edu_id]);

    return rows[0] ?? null;
};

export const update = async (user_id, edu_id, fields) => {
    const fieldMap = {
        education_type: "education_type",
        start_date:  "from_date",
        end_date: "to_date",
        marks: "marks",
        marks_type: "mark_type",
        total_mark: "total_mark",
        institute_name: "institute_name",
        stream: "stream",
    };

    const setClauses = [];
    const  values = [];
    let paramIndex = 1;

    for(const[key,column] of Object.entries(fieldMap)){
        if(fields[key] !== undefined){
            setClauses.push(`${column} = $${paramIndex}`);
            values.push(fields[key]);
            paramIndex++;
        }
    }

    values.push(user_id);
    values.push(edu_id);

    const sql = `
    UPDATE education
    SET ${setClauses.join(",")}
    WHERE user_id = $${paramIndex}
    AND education_id = $${paramIndex+1}
    RETURNING *
    `;

    const {rows} = await query(sql, values);
    return rows[0] ?? null;
};