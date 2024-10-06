import { Accounts, AccountType } from "../../database/accounts.js";
import dateFns, { differenceInDays, parse } from "date-fns";
import { AccountActivity } from "../../database/account_activity.js";
import axios from "axios";
import { getSteamLink } from "../../utils/getSteamLink.js";
import * as cheerio from "cheerio";

// Получаем купленные аккаунты на которых не запускали игры более 7 дней
export async function getNonActive() {
	const ids: AccountType[] = [];
	try {
		const currentDate = new Date();
		const now = dateFns.format(currentDate, "yyyy-MM-dd");

		const accountActivity = new AccountActivity();
		const accounts = new Accounts();
		const activityResult = await accountActivity.getAll(` where date_expired >= '${now}' AND user_count < 3`);

		for (const activity of activityResult) {
			const account = await accounts.getBy(activity.account_id);
			if (account) {
				const profile = await axios.get(getSteamLink(account.steam_id));
				const $ = cheerio.load(profile.data);
				const recentGames = $(".game_info_details").first().html() ?? "";
				if (!recentGames) return;

				const lastPlay = recentGames.replace("\t", "").split(" ");
				const lastPlayDateString = `${lastPlay.at(-2)} ${lastPlay.at(-1)}`;
				const lastPlayFormattedString = parse(lastPlayDateString, "d MMM", new Date());
				const differenceDays = differenceInDays(currentDate, lastPlayFormattedString);

				if (differenceDays > 7) {
					ids.push(account);
				} else console.log("cant sell");
			}
		}
	} catch (err) {
		console.log(err);
	}

	return ids;
}