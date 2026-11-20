require('dotenv').config();
const pool = require('../config/db');

async function setup() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_reset_otps (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_hash TEXT NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_reset_otp_email
            ON password_reset_otps(email);
        `);
        console.log('OTP database table created successfully!');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

setup();
