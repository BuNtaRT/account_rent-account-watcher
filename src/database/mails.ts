import { Query } from "./query.js";

export class Mails extends Query<MailType> {
	constructor() {
		super("mail", "id", "id");
	}
}

// id SERIAL PRIMARY KEY,
// address VARCHAR(255) NOT NULL,
// password VARCHAR(255) NOT NULL

export type MailType = {
	id: number;
	address: string;
	password: string;
};
