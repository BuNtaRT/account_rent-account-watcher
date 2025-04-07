import { AccountType } from "../../database/accounts.js";
import dateFns, { differenceInDays, parse } from "date-fns";
import axios from "axios";
import * as cheerio from "cheerio";
import { pool } from "../../database/db.js";
import { delay } from "../../utils/delay.js";
import { getSteamLink } from "../../utils/getSteamLink.js";

// Получаем купленные аккаунты на которых не запускали игры более 7 дней
export async function getNonActive() {
	const ids: AccountWithProductType[] = [];

	const currentDate = new Date();
	const now = dateFns.format(currentDate, "yyyy-MM-dd");

	const query = `
      SELECT accounts.*, games_product.digiseller_id
      FROM accounts
               JOIN account_activity ON accounts.id = account_activity.account_id
               LEFT JOIN games_account_relation ON accounts.id = games_account_relation.account_id
               LEFT JOIN games_product ON games_account_relation.game_id = games_product.id
      WHERE account_activity.date_expired > $1 AND account_activity.user_count > 0 AND account_activity.user_count < 3 AND account_activity.date_update <= $1 - INTERVAL '7 days';
	`;

	const accountsResult = (await pool.query({ text: query, values: [now] })).rows as AccountWithProductType[];

	for (const account of accountsResult) {
		//что бы часто не спамить на стим
		await delay(1000);
		const link = getSteamLink(account.account_steam);
		const profile = await axios.get(link);
		const $ = cheerio.load(profile.data);
		const recentGames = $(".game_info_details").first().html() ?? "";

		if (!recentGames) {
			throw new Error(`recentGames block not found ${link}`);
		}
		const match = recentGames.match(/last played on (\d{1,2} \w{3}(?:, \d{4})?)/);
		const lastPlayDateString = match ? match[1] : null;

		if (!lastPlayDateString) {
			throw new Error(`recentGames last play not found ${link}`);
		}

		const parseFormat = lastPlayDateString.includes(",") ? "d MMM, yyyy" : "d MMM";
		const lastPlayFormattedString = parse(lastPlayDateString, parseFormat, new Date());
		const differenceDays = differenceInDays(currentDate, lastPlayFormattedString);

		if (differenceDays > 7) {
			ids.push(account);
		}
	}

	return ids;
}

export type AccountWithProductType = AccountType & { digiseller_id: string };
