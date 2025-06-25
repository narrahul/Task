import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Product } from "../entities/Product";

dotenv.config();

const isSupabase = process.env.DB_HOST?.includes('supabase.com');

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [Product],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
  ssl: isSupabase ? {
    rejectUnauthorized: false
  } : false
});