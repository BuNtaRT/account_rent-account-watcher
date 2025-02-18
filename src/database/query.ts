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
		const fieldsName = Object.keys(value).join(", ");
		const values = Object.values(value)
			.map((val) => `'${val}'`)
			.join(", ");
		return pool.query(`INSERT INTO ${this.table} (${fieldsName}) values (${values}) RETURNING * ${additional}`);
	}
	async update(value: ClearIdT<T>, id: number, additional: string = "") {
		const updateFields: string[] = [];
		Object.keys(value).forEach((stringKey) => {
			const key = stringKey as keyof ClearIdT<T>;
			updateFields.push(`${stringKey} = '${value[key]}'`);
		});

		return pool.query(`UPDATE ${this.table} SET ${updateFields.join(", ")} where id = '${id}' RETURNING * ${additional}`);
	}
	async getAll(additional: string = "") {
		return (await pool.query(`SELECT * FROM ${this.table} ${additional}`)).rows as T[];
	}
	async getBy<K>(clause: K, additional: string = "") {
		return (await pool.query(`SELECT * FROM ${this.table} where ${this.getByField.toString()} = '${clause}' ${additional}`)).rows[0] as T | undefined;
	}
	async remove<K>(key: K, colum: keyof T | null = null, additional: string = "") {
		return pool.query(`DELETE FROM ${this.table} where ${colum ? colum.toString() : this.removeByField.toString()} = '${key}' ${additional}`);
	}
}

type ClearIdT<T> = Omit<T, "id">;
