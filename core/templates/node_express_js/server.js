const sequelize = require('./config/database');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.sync();
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

startServer();