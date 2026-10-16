import { query } from "#src/config/db.js";
export const findAll = async () => {
  const sql = ' SELECT * FROM assets';
  const { rows } = await query(sql);
  return rows;
};
export const getResumeEntityAssets = async (user_id, re_id) => {
  const sql = `
       SELECT * FROM Assets 
        WHERE user_id = $1 AND re_id=$2   `;


  const { rows } = await query(sql, [user_id, re_id]);

  return rows;
}


export const create = async (user_id, re_id, title, link, description = null, asset_type) => {
  const sql = `INSERT INTO assets (user_id,re_id,title, link, description,asset_type)
  VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const { rows } = await query(sql, [user_id, re_id, title, link, description, asset_type]);
  return rows[0];
};



export const remove = async (id) => {
  const sql = `
    DELETE FROM assets
    WHERE asset_id=$1
    RETURNING *
    `;

  const { rows } = await query(sql, [id]);
  return rows[0];
};

export const update = async (user_id, id, fields) => {
  const allowedKeys = ['title', 'link', 'description', 'asset_type'];
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
  values.push(user_id);
  const sql = `UPDATE assets SET ${setClauses.join(', ')}
  where asset_id = $${paramIndex} AND user_id=$${paramIndex + 1}
  RETURNING *`;
  const { rows } = await query(sql, values);
  return rows[0] ?? null;
};
