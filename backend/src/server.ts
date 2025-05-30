import express from 'express';
import { DbConnection } from './database/dbConnection';

const app = express();

async function connectDatabase() {
  const dataSource = await DbConnection.createConnection();
  if (!dataSource) {
    console.error('Failed to initialize database connection');
    process.exit(1);
  }
  console.log('Database connected!');
  return dataSource;
}

async function startServer() {
  await connectDatabase();

  app.get('/', (_req, res) => {
    res.send('Hello from backend!');
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

startServer();
