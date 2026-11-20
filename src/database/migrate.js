require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function migrate() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        const id = '001_initial';
        const existing = await client.query(
            'SELECT id FROM schema_migrations WHERE id = $1', [id]
        );

        if (existing.rowCount === 0) {
            const sql = fs.readFileSync(
                path.join(__dirname, 'migrations', `${id}.sql`), 'utf8'
            );
            await client.query(sql);
            await client.query(
                'INSERT INTO schema_migrations(id) VALUES($1)', [id]
            );
            console.log('Migration applied:', id);
        } else {
            console.log('Migration already applied:', id);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
