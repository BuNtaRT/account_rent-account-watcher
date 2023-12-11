import { Query } from "./query.js";

export class ProductAccount extends Query<ProductAccountType> {
	constructor() {
		super("product_account", "id", "id");
	}
}

//     id SERIAL PRIMARY KEY,
//     product_id INT NOT NULL,
//     account_id INT REFERENCES accounts(id),

export type ProductAccountType = {
	id: number;
	product_id: number;
	account_id: number;
};
