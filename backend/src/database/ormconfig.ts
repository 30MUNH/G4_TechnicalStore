import path from 'path';
import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { Account } from "../auth/account/account.entity";
import { Role } from "../auth/role/role.entity";
import { Product } from "../product/product.entity";
import { RefreshToken } from "@/auth/jwt/refreshToken.entity";
import { CartItem } from '@/Cart/cartItem.entity';
import { Cart } from '@/Cart/cart.entity';

export default {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Admin123",
  database: process.env.DB_NAME || "TechnicalStore",

  synchronize: process.env.DB_SYNCHRONIZE || true,

  // entities: [path.join(__dirname, '../*/**/*.entity.{ts,js}')],
  entities: [Account, Role, Product, RefreshToken, Cart, CartItem],

  cli: {
    entitiesDir: "src",
  },
} as DataSourceOptions;
