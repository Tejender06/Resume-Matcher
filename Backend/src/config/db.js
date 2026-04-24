const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Application cannot start without a database.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

const initDB = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS matches (
            id SERIAL PRIMARY KEY,
            resume_text TEXT NOT NULL,
            job_description TEXT NOT NULL,
            score INTEGER NOT NULL,
            matched_keywords TEXT[] NOT NULL,
            missing_keywords TEXT[] NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(createTableQuery);
    console.log('PostgreSQL Database connected and "matches" table is ready.');
};

module.exports = {
    pool,
    initDB
};
