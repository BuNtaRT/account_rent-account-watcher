import { delay } from "../../utils/delay.js";
import axios from "axios";
import { workerMail } from "../mail/workerMail.js";
import { getDisableGuardLink } from "../mail/mailModules/index.js";
import { SteamModuleArgumentsType } from "./workerSteam.js";

export const disableGuard = (props: SteamModuleArgumentsType) => {
	const { account, steamClient, resolver } = props;
	const mailId = account.mail_id;

	steamClient.on("webSession", async (sessionID, cookie) => {
		const guardDetail = await steamClient.getSteamGuardDetails();

		if (guardDetail.isSteamGuardEnabled) {
			await delay(3000);

			let data = new FormData();
			data.append("action", "actuallynone");
			data.append("sessionid", sessionID);

			const res = await axios.post("https://store.steampowered.com/twofactor/manage_action", data, { headers: { cookie } });
			console.log("send disable", res);
			const link = await workerMail(getDisableGuardLink, mailId);
			await axios.get(link);

			steamClient.logOff();
			resolver(true);
		} else {
			steamClient.logOff();
			resolver(true);
		}
	});
};
