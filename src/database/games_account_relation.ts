import { Query } from "./query.js";

export class GamesAccountRelation extends Query<GamesAccountRelationType> {
	constructor() {
		super("games_account_relation", "id", "id");
	}
}
//    id SERIAL PRIMARY KEY,
//     game_id INT REFERENCES games(id),
//     account_id INT REFERENCES accounts(id)
export type GamesAccountRelationType = {
	id: number;
	game_id: number;
	account_id: number;
};
