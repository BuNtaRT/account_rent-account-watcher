import { Query } from "./query.js";

export class AccountActivity extends Query<AccountActivityType> {
	constructor() {
		super("account_activity", "id", "id");
	}
}
//    id SERIAL PRIMARY KEY,
//     account_id INT REFERENCES accounts(id),
//     date_expired DATE NOT NULL,
//     user_count INT
export type AccountActivityType = {
	id: number;
	account_id: number;
	date_expired: string;
	user_count?: number;
};
