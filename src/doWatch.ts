import { AccountActivity } from "./database/account_activity.js";
import dateFns, { differenceInDays, parse } from "date-fns";
import { Accounts } from "./database/accounts.js";
import axios from "axios";
import * as cheerio from "cheerio";
import { InitMail } from "./utils/mailWorking.js";

const steamProfile = (id: string) => `https://steamcommunity.com/profiles/${id}`;

export const doWatch = async () => {
	console.log("doWatch");
	InitMail();
	// try {
	// 	const currentDate = new Date();
	// 	const now = dateFns.format(currentDate, "yyyy-MM-dd");
	//
	// 	const accountActivity = new AccountActivity();
	// 	const accounts = new Accounts();
	// 	const activityResult = await accountActivity.getAll(` where date_expired >= '${now}' AND user_count < 3`);
	//
	// 	for (const activity of activityResult) {
	// 		const account = await accounts.getBy(activity.account_id);
	// 		if (account) {
	// 			const profile = await axios.get(steamProfile(account.steam_id));
	// 			const $ = cheerio.load(profile.data);
	// 			const recentGames = $(".game_info_details").first().html() ?? "";
	// 			if (!recentGames) return;
	//
	// 			const lastPlay = recentGames.replace("\t", "").split(" ");
	// 			const lastPlayDateString = `${lastPlay.at(-2)} ${lastPlay.at(-1)}`;
	// 			const lastPlayFormattedString = parse(lastPlayDateString, "d MMM", new Date());
	// 			const differenceDays = differenceInDays(currentDate, lastPlayFormattedString);
	//
	// 			if (differenceDays > 7) {
	// 				console.log("account - ", account.login, " - ", account.password, " can sell");
	// 			}
	// 		}
	// 	}
	// } catch (err) {
	// 	console.log(err);
	// }
};
