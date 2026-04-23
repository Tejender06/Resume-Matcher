const { Pool } = require('pg');

let connStr = process.env.DATABASE_URL;
if (connStr && !connStr.includes('ssl=')) {
    connStr += (connStr.includes('?') ? '&' : '?') + 'ssl=true';
}

const pool = new Pool({
    connectionString: connStr,
    ssl: {
        rejectUnauthorized: false // Required for Render's external connections
    }
});

// Function to initialize the database and create the table if it doesn't exist
const initDB = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            console.log('⚠️ DATABASE_URL not found. Skipping database initialization.');
            return;
        }

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
        console.log('✅ PostgreSQL Database connected and "matches" table is ready.');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    initDB
};
