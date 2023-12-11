import { pool, Tables } from "./db.js";

export class Query<T> {
	private readonly table: Tables;
	private readonly getByField: keyof T;
	private readonly removeByField: keyof T;
	constructor(table: Tables, getByField: keyof T, removeByField: keyof T) {
		this.table = table;
		this.getByField = getByField;
		this.removeByField = removeByField;
	}

	async create(value: ClearIdT<T>, additional: string = "") {
		try {
			const fieldsName = Object.keys(value).join(", ");
			const values = Object.values(value)
				.map((val) => `'${val}'`)
				.join(", ");
			return pool.query(`INSERT INTO ${this.table} (${fieldsName}) values (${values}) RETURNING * ${additional}`);
		} catch (err) {
			console.log("ОШИБКА - ", err);
			return false;
		}
	}

	async update(value: ClearIdT<T>, id: number, additional: string = "") {
		try {
			const updateFields: string[] = [];
			Object.keys(value).forEach((stringKey) => {
				const key = stringKey as keyof ClearIdT<T>;
				updateFields.push(`${stringKey} = '${value[key]}'`);
			});

			return pool.query(`UPDATE ${this.table} SET ${updateFields.join(", ")} where id = '${id}' RETURNING * ${additional}`);
		} catch (err) {
			console.log("ОШИБКА - ", err);
			return false;
		}
	}

	async getAll(additional: string = "") {
		try {
			console.log(`SELECT * FROM ${this.table} ${additional}`);
			return (await pool.query(`SELECT * FROM ${this.table} ${additional}`)).rows as T[];
		} catch (err) {
			console.log("ОШИБКА - ", err);
			return [];
		}
	}
	async getBy<K>(clause: K, additional: string = "") {
		try {
			return (await pool.query(`SELECT * FROM ${this.table} where ${this.getByField.toString()} = '${clause}' ${additional}`)).rows[0] as
				| T
				| undefined;
		} catch (err) {
			console.log("ОШИБКА - ", err);
			return undefined;
		}
	}
	async remove<K>(key: K, colum: keyof T | null = null, additional: string = "") {
		try {
			return pool.query(`DELETE FROM ${this.table} where ${colum ? colum.toString() : this.removeByField.toString()} = '${key}' ${additional}`);
		} catch (err) {
			console.log("ОШИБКА - ", err);
			return false;
		}
	}
}

type ClearIdT<T> = Omit<T, "id">;
