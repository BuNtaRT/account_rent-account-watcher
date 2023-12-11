import pg from "pg";

export const pool = new pg.Pool({
	user: "account",
	password: "accountPassword",
	host: "localhost",
	port: 5432,
	database: "account-management",
});

export type Tables = "games" | "accounts" | "games_account_relation" | "account_activity" | "product_account";
