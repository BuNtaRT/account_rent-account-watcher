import { Accounts, AccountType } from "../../database/accounts.js";
import SteamUser from "steam-user";
import { workerMail } from "../mail/workerMail.js";
import { getAuthCode } from "../mail/mailModules/getAuthCode.js";
import { delay } from "../../utils/delay.js";

export const workerSteam = async (accountId: string, module: ModuleType) => {
	const accountQuery = new Accounts();
	const account = await accountQuery.getBy(accountId);

	if (!account) throw `account not found by id ${accountId}`;

	const client = new SteamUser();

	module(client, account);

	client.logOn({
		accountName: account.login,
		password: account.password,
	});

	client.on("steamGuard", async (_, callback) => {
		console.log("steamGuard");
		const code = await workerMail(getAuthCode, account.mail_id);
		await delay(1000);
		console.log(code);
		callback(code);
	});
};

type ModuleType = (steamClient: SteamUser, account: AccountType) => void;
