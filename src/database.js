import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {};

    constructor() {
        this.#load();
    }

    async #load() {
        try {
            const data = await fs.readFile(databasePath, 'utf8');
            this.#database = JSON.parse(data);
        } catch {
            this.#persist();
        }
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2));
    }

    select(table, search) {
        const data = this.#database[table] || [];

        if (!search) {
            return data;
        }

        return data.filter(row =>
            Object.entries(search).every(([key, value]) =>
                value ? row[key]?.includes(value) : true
            )
        );
    }

    insert(table, data) {
        if (!Array.isArray(this.#database[table])) {
            this.#database[table] = [];
        }
        this.#database[table].push(data);
        this.#persist();
        return data;
    }

    update(table, id, data) {
        const rows = this.#database[table] || [];
        const rowIndex = rows.findIndex(row => row.id === id);

        if (rowIndex > -1) {
            this.#database[table][rowIndex] = { ...rows[rowIndex], ...data };
            this.#persist();
        }
    }

    delete(table, id) {
        const rows = this.#database[table] || [];
        const rowIndex = rows.findIndex(row => row.id === id);

        if (rowIndex > -1) {
            rows.splice(rowIndex, 1);
            this.#persist();
        }
    }
}
