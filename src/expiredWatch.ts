import dateFns from "date-fns";
import { AccountActivity } from "./database/account_activity.js";
import { Accounts } from "./database/accounts.js";

const expiredWatch = async () => {
	const currentDate = new Date();
	const now = dateFns.format(currentDate, "yyyy-MM-dd");

	const accountActivity = new AccountActivity();
	const accounts = new Accounts();
	const activityResult = await accountActivity.getAll(` where date_expired < '${now}'`);

	for (const { id } of activityResult) {
		const account = await accounts.getBy(id);

		if (account) {
		}
	}
};

export default expiredWatch;
