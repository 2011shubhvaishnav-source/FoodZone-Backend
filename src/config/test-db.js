require('dotenv').config();

const pool = require('./db');

async function testDatabase() {
    try {
        const result = await pool.query('SELECT NOW() AS current_time');
        console.log('FoodZone Database Connected!');
        console.log('Database Time:', result.rows[0].current_time);
    } catch (error) {
        console.error('Database Connection Failed:', error.message);
    } finally {
        await pool.end();
    }
}

testDatabase();
