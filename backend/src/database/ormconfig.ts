import path from 'path';
import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';

export default {
  type: 'postgres',
  host: process.env.DB_HOST || '',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',

  synchronize: process.env.DB_SYNCHRONIZE || true,

  entities: [path.join(__dirname, '../*/**/*.entity.{ts,js}')],
  cli: {
    entitiesDir: 'src',
  },
} as DataSourceOptions;
