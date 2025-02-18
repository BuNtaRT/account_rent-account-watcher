import { Query } from "./query.js";

export class Accounts extends Query<AccountType> {
	constructor() {
		super("accounts", "id", "id");
	}
}
//     id SERIAL PRIMARY KEY,
//     login VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL,
//		 account_steam VARCHAR(255) NOT NULL,
//		 mail_id INT REFERENCES mail(id)
export type AccountType = {
	id: number;
	login: string;
	password: string;
	account_steam: string;
	mail_id: number;
};
