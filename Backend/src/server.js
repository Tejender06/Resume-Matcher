if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = require('./app');
const { initDB, pool } = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await initDB();
        
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        process.on('SIGINT', async () => {
            console.log('\nShutting down gracefully...');
            await pool.end();
            server.close(() => {
                console.log('Server and database pool closed.');
                process.exit(0);
            });
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
