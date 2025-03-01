import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

export const pool = new pg.Pool({
	user: DB_USER,
	password: DB_PASSWORD,
	host: DB_HOST,
	port: 5432,
	database: DB_NAME,
});

export type Tables = "games_product" | "accounts" | "games_account_relation" | "account_activity" | "mail";
