import { Query } from "./query.js";

export class Games extends Query<GamesType> {
	constructor() {
		super("games", "id", "id");
	}
}
//    id SERIAL PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     steam_id VARCHAR(255) NOT NULL
export type GamesType = {
	id: number;
	name: string;
	steam_id: string;
};
