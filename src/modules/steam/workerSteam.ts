import { Accounts, AccountType } from "../../database/accounts.js";
import SteamUser from "steam-user";
import { workerMail } from "../mail/workerMail.js";
import { getAuthCode } from "../mail/mailModules/index.js";
import { delay } from "../../utils/delay.js";

export const workerSteam = async (accountId: string, module: ModuleType) =>
	new Promise(async (resolver) => {
		const accountQuery = new Accounts();
		const account = await accountQuery.getBy(accountId);

		if (!account) throw `account not found by id ${accountId}`;

		const steamClient = new SteamUser();

		module({
			steamClient,
			account,
			resolver,
		});

		steamClient.logOn({
			accountName: account.login,
			password: account.password,
		});

		console.log(account.login, account.password);
		steamClient.on("steamGuard", async (_, callback) => {
			console.log("steamGuard");
			const code = await workerMail(getAuthCode, account.mail_id.toString());
			await delay(1000);
			console.log(code);
			callback(code);
		});
	});

export type SteamModuleArgumentsType = {
	steamClient: SteamUser;
	account: AccountType;
	resolver: (value: boolean) => void;
};
export type ModuleType = (args: SteamModuleArgumentsType) => void;
