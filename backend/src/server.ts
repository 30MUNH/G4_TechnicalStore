import express from 'express';
import { AppDataSource, DbConnection } from './database/dbConnection';
import accountRoutes from '../src/route/account.routes';

const app = express();
app.use(express.json()); // Important for parsing JSON bodies

async function connectDatabase() {
  const dataSource = await DbConnection.createConnection();
  if (!dataSource) {
    console.error('Failed to initialize database connection');
    process.exit(1);
  }
  console.log('Database connected!');
  // Init db 
  await AppDataSource.initialize();
  return dataSource;
}

async function startServer() {
  await connectDatabase();

  app.use('/api/accounts', accountRoutes); // <-- Mount account endpoint

  app.get('/', (_req, res) => {
    res.send('Hello from backend!');
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

startServer();
