import { Query } from "./query.js";

export class Accounts extends Query<AccountType> {
	constructor() {
		super("accounts", "id", "id");
	}
}
//    id SERIAL PRIMARY KEY,
//     login VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     steam_id VARCHAR(255) NOT NULL
export type AccountType = {
	id: number;
	login: string;
	password: string;
	steam_id: string;
	mail_id: number;
};
