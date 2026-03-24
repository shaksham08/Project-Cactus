const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const connectDatabase = require('./config/db');

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});