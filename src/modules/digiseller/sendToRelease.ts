import { AccountWithProductType } from "../account/getNoneActiveAccounts.js";
import dotenv from "dotenv";
import { sendToTelegram } from "../../utils/sentToTelegram.js";
import { pool } from "../../database/db.js";
import axios from "axios";

dotenv.config();

const PORT_DGI = process.env.PORT_DGI;
const KEY_DGI = process.env.KEY_DGI;
const HOST_DGI = process.env.HOST_DGI;

export const sendToRelease = async (accounts: AccountWithProductType[], isExpired: boolean) => {
	const formatingAccounts = accounts.reduce((acc, { login, password, digiseller_id }) => {
		if (!acc[digiseller_id]) acc[digiseller_id] = [];

		acc[digiseller_id].push({ login, password });

		return acc;
	}, {} as ResaleAccountType);
	const response = await axios.post(`http://${HOST_DGI}:${PORT_DGI}/product-update?apikey=${KEY_DGI}`, formatingAccounts);

	if (response.status !== 200)
		await sendToTelegram(` product-update from account watcher status ${response.status} res - ${JSON.stringify(response.data)}`);
	else {
		const accountIds = accounts.map(({ id }) => id);

		const query = `
  		UPDATE account_activity
  		SET date_update = NOW() ${isExpired ? ", user_count = 0" : ""}
  		WHERE account_id = ANY($1);
	`;

		const accountsResult = (await pool.query({ text: query, values: [accountIds] })).rowCount;

		console.log(`update dates for ${accountsResult}/${accounts.length}`);
		if (accountsResult !== accounts.length) await sendToTelegram(`update dates for ${accountsResult}/${accounts.length}`);
	}
};

type ResaleAccountType = { [key: string]: { password: string; login: string }[] };
