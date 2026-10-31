import { query } from "#src/config/db.js";

export const findAll = async () => {
  const sql = `SELECT * FROM links`;
  const { rows } = await query(sql);
  return rows;
};

export const getProfileLinks = async (user_id) => {
  const sql = `
        SELECT * from links
        WHERE user_id = $1 AND re_id IS NULL 
    `;

  const { rows } = await query(sql, [user_id]);

  return rows;
};

export const getResumeEntityLinks = async (user_id, re_id) => {
  const sql = `
        SELECT * FROM links 
        WHERE user_id = $1 AND re_id = $2
    `;


  const { rows } = await query(sql, [user_id, re_id]);

  return rows;
}

export const create = async (user_id, re_id = null, link, title, description = null) => {
  const sql = `
    INSERT INTO links (link, title, description, user_id, re_id)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
    `;

  const { rows } = await query(sql, [link, title, description, user_id, re_id]);

  return rows[0];
};

export const remove = async (user_id, id) => {
  const sql = `
    DELETE FROM links
    WHERE id=$1 AND user_id = $2
    RETURNING *
    `;

  const { rows } = await query(sql, [id,user_id]);
  return rows[0];
};

export const update = async (user_id, id, fields) => {
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

  values.push(id);
  const idIndex = paramIndex;
  paramIndex++;

  values.push(user_id);
  const userIdIndex = paramIndex;

  const sql = `
    UPDATE links
    SET ${setClauses.join(', ')}
    WHERE id = $${idIndex} AND user_id = $${userIdIndex}
    RETURNING *;
    `;

  const { rows } = await query(sql, values);
  return rows[0] ?? null;
};
