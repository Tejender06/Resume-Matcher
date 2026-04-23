require('dotenv').config();
const app = require('./app');
const { initDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

// Initialize Database then start Server
initDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });
}).catch(err => {
    console.error('Failed to start server due to database error:', err);
    process.exit(1);
});
