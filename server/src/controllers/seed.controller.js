import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import asyncHandler from '#lib/asyncHandler.js';
import { RESPONSE_CODES } from '#lib/common.js';
import { BadRequestError, NotFoundError } from '#lib/errors.js';
import { transaction, query } from '#config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_SQL_PATH = join(__dirname, '..', 'config', 'seed.sql');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /seed  { user_id }
 * Resets and seeds the given user's resume data with a mixed
 * Full-Stack + AI/ML profile (see config/seed.sql). Test-only, unauthenticated.
 */
export const seedUser = asyncHandler(async (req, res) => {
    const { user_id } = req.body ?? {};

    if (!user_id || !UUID_REGEX.test(user_id)) {
        throw new BadRequestError('A valid user_id (UUID) is required in the request body');
    }

    const userExists = await query('SELECT 1 FROM users WHERE id = $1', [user_id]);
    if (userExists.rowCount === 0) throw new NotFoundError(`User "${user_id}" not found`);

    // Read on each request so edits to seed.sql apply without a restart.
    const seedSql = readFileSync(SEED_SQL_PATH, 'utf-8');

    await transaction(async (client) => {
        // Pass the user id via a transaction-local setting (bound parameter, no string interpolation).
        await client.query(`SELECT set_config('seed.user_id', $1, true)`, [user_id]);
        await client.query(seedSql);
    });

    const counts = await query(
        `SELECT re_type, COUNT(*)::int AS count
         FROM resume_entity WHERE user_id = $1
         GROUP BY re_type ORDER BY re_type`,
        [user_id]
    );

    res.status(RESPONSE_CODES.CREATED_CODE).json({
        success: true,
        message: `Seed data inserted for user ${user_id}`,
        data: counts.rows,
    });
});
