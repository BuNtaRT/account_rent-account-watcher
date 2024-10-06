import { AccountType } from "../../database/accounts.js";
import SteamUser from "steam-user";
import { delay } from "../../utils/delay.js";
import axios from "axios";
import { workerMail } from "../mail/workerMail.js";
import { getDisableGuardLink } from "../mail/mailModules/getDisableGuardLink.js";

export const disableGuard = (steamClient: SteamUser, account: AccountType) => {
	const mailId = account.mail_id;

	steamClient.on("webSession", async (sessionID, cookie) => {
		console.log("webSession", sessionID, cookie);
		await delay(3000);

		let data = new FormData();
		data.append("action", "actuallynone");
		data.append("sessionid", sessionID);

		await axios.post("https://store.steampowered.com/twofactor/manage_action", data, { headers: { cookie } });
		const link = await workerMail(getDisableGuardLink, mailId);
		await axios.get(link);
	});
};
