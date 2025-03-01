import { sendToRelease } from "./modules/digiseller/sendToRelease.js";
import { AccountWithProductType } from "./modules/account/getNoneActiveAccounts.js";

/*
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
 */
console.log("send trash");
await sendToRelease([{ login: "log", password: "pass", digiseller_id: "1234444444" }] as AccountWithProductType[]);
