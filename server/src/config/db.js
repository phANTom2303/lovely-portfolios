import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const dbuser = process.env.PGUSER
const dbpass = process.env.PGPASSWORD
const dbhost = process.env.PGHOST
const dbport = process.env.PGPORT
const dbdatabase = process.env.PGDATABASE


const pool = new Pool({
    user: dbuser,
    password: dbpass,
    host: dbhost,
    port: dbport,
    database: dbdatabase,
    max: 20, // Max clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Standard query wrapper with execution time logging
export const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
};

// Transaction helper to ensure atomic operations
export const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export { pool };
