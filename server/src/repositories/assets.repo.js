import { query } from "#src/config/db.js";
export const findAll = async () => {
  const sql = ' SELECT * FROM assets';
  const { rows } = await query(sql);
  return rows;
};
export const getResumeEntityAssets = async (user_id, re_id) => {
  const sql = `
       SELECT * FROM Assets 
        WHERE id = any(
            SELECT UNNEST(asset_id)
            FROM resume_entity 
            WHERE user_id=$1 AND re_id=$2
        )
    `;


  const { rows } = await query(sql, [user_id, re_id]);

  return rows;
}


export const create = async (title, link, description = null, asset_type) => {
  const sql = `INSERT INTO assets (title, link, description)
  VALUES ($1,$2,$3,$4) RETURNING *`;
  const { rows } = await query(sql, [title, link, description, asset_type]);
  return rows[0];
};


export const remove = async (id) => {
  const sql = `
    DELETE FROM assets
    WHERE id=$1
    RETURNING *
    `;

  const { rows } = await query(sql, [id]);
  return rows[0];
};

export const update = async (id, fields) => {
  const allowedKeys = ['title', 'link', 'description', 'asset_type'];
  let setClauses = [];
  let values = [];
  let paramIndex = 1;
  for (const key in allowedKeys) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key}=$${paramIndex}`);
      values.push(fields[key]);
      paramIndex++;
    }
  }
  values.push(id);
  const sql = `UPDATE assets SET ${setClauses.join(', ')}
  where id = $${paramIndex} RETURNING *`;
  const { rows } = await query(sql, values);
  return rows[0] ?? null;
};
