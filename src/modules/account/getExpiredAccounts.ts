import dateFns from "date-fns";
import { pool } from "../../database/db.js";
import { AccountWithProductType } from "./getNoneActiveAccounts.js";

export const getExpiredAccounts = async () => {
	const currentDate = new Date();
	const now = dateFns.format(currentDate, "yyyy-MM-dd");

	const query = `
      SELECT accounts.*, games_product.digiseller_id
      FROM accounts
               JOIN account_activity ON accounts.id = account_activity.account_id
               LEFT JOIN games_account_relation ON accounts.id = games_account_relation.account_id
               LEFT JOIN games_product ON games_account_relation.game_id = games_product.id
      WHERE account_activity.date_expired <= $1 AND account_activity.user_count > 0 AND account_activity.date_update < $1;
	`;

	return (await pool.query({ text: query, values: [now] })).rows as AccountWithProductType[];
};
