import { Accounts } from "./database/accounts.js";
import passfather from "passfather";
import { seleniumChangePass } from "./modules/steam/seleniumChangePass.js";
import { workerSteam } from "./modules/steam/workerSteam.js";
import { disableGuard } from "./modules/steam/disableGuard.js";

export const changePassword = async (accountId: string) => {
	const accounts = new Accounts();
	const accountData = await accounts.getBy(accountId);
	if (!accountData) throw `account not found by id ${accountId}`;

	const steamClient = await workerSteam(accountId, disableGuard);

	if (steamClient) {
		const generationPass = passfather({
			length: 10,
			symbols: false,
		});

		const response = await seleniumChangePass(accountData, generationPass);

		if (response === "complete") {
			console.log(`change ${accountId} pass to `, generationPass);

			const accountDb = new Accounts();
			await accountDb.update({ ...accountData, password: generationPass }, accountData.id);
		}

		return generationPass;
	} else throw new Error(`steamClient false in changePassword accountId=${accountId}`);
};
