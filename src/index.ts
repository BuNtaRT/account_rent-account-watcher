import { getNonActive } from "./modules/account/getNoneActiveAccounts.js";
import { getExpiredAccounts } from "./modules/account/getExpiredAccounts.js";
import { changePassword } from "./changePassword.js";
import { sendToRelease } from "./modules/digiseller/sendToRelease.js";
import { sendToTelegram } from "./utils/sentToTelegram.js";

try {
	const nonActiveAccounts = await getNonActive();
	const expiredAccounts = await getExpiredAccounts();
	if (!nonActiveAccounts.length && !expiredAccounts.length) process.exit(0);

	if (nonActiveAccounts.length) {
		await sendToRelease(nonActiveAccounts);
	}

	if (expiredAccounts.length) {
		for (const expiredAccount of expiredAccounts) {
			expiredAccount.password = await changePassword(expiredAccount.id.toString());
		}
		await sendToRelease(expiredAccounts);
	}
} catch (e) {
	console.error(e);
	await sendToTelegram(e);
	throw e;
}
